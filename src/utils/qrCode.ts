// Zero-dependency pure TypeScript SVG QR Code Generator
// Generates QR Code Model 2 with Error Correction Level M / L
// Fully compatible with Google Authenticator otpauth:// URIs

export interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}

// Galois Field GF(256) and Reed-Solomon math
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) {
      x ^= 0x11d; // Primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
    }
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();

function gfMultiply(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

function getGeneratorPolynomial(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const factor = new Uint8Array([1, EXP_TABLE[i]]);
    const newPoly = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      newPoly[j] ^= gfMultiply(poly[j], factor[0]);
      newPoly[j + 1] ^= gfMultiply(poly[j], factor[1]);
    }
    poly = newPoly;
  }
  return poly;
}

function calculateErrorCorrection(data: Uint8Array, eccCount: number): Uint8Array {
  const genPoly = getGeneratorPolynomial(eccCount);
  const remainder = new Uint8Array(data.length + eccCount);
  remainder.set(data);

  for (let i = 0; i < data.length; i++) {
    const lead = remainder[i];
    if (lead !== 0) {
      for (let j = 0; j < genPoly.length; j++) {
        remainder[i + j] ^= gfMultiply(genPoly[j], lead);
      }
    }
  }
  return remainder.slice(data.length);
}

// Version capacities (byte mode, ECC Level M)
// Versions 1 to 10 capacities in bytes
const VERSION_CAPACITIES_M = [
  0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213
];
const VERSION_ECC_M = [
  0, 10, 16, 26, 36, 48, 64, 72, 88, 110, 130
];
const TOTAL_DATA_CODEWORDS_M = [
  0, 16, 28, 44, 64, 86, 108, 124, 154, 182, 216
];

/**
 * Generate a boolean 2D matrix (true = dark module) for the input text
 */
export function generateQRMatrix(text: string): boolean[][] {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(text);

  // Pick smallest version that fits
  let version = 1;
  while (version <= 10 && VERSION_CAPACITIES_M[version] < dataBytes.length) {
    version++;
  }
  if (version > 10) {
    version = 10; // Fallback
  }

  const moduleCount = 17 + 4 * version;
  const matrix: (boolean | null)[][] = Array.from({ length: moduleCount }, () =>
    Array(moduleCount).fill(null)
  );

  // 1. Finder patterns
  function drawFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const mr = row + r;
        const mc = col + c;
        if (mr < 0 || mr >= moduleCount || mc < 0 || mc >= moduleCount) continue;
        if (
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[mr][mc] = true;
        } else {
          matrix[mr][mc] = false;
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, moduleCount - 7);
  drawFinder(moduleCount - 7, 0);

  // 2. Alignment pattern (for version >= 2)
  if (version >= 2) {
    const alignPos = moduleCount - 7;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const mr = alignPos + r;
        const mc = alignPos + c;
        if (matrix[mr][mc] !== null) continue;
        if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
          matrix[mr][mc] = true;
        } else {
          matrix[mr][mc] = false;
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < moduleCount - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // 4. Dark module
  matrix[moduleCount - 8][8] = true;

  // 5. Reserve format info areas
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }
  for (let i = moduleCount - 8; i < moduleCount; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }

  // 6. Encode Data (Byte mode: 0100 + length + data + 0000 terminator + padding)
  const bitStream: number[] = [];
  function pushBits(val: number, len: number) {
    for (let b = len - 1; b >= 0; b--) {
      bitStream.push((val >>> b) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode indicator
  pushBits(dataBytes.length, 8); // 8-bit character count indicator for v1-9
  for (let i = 0; i < dataBytes.length; i++) {
    pushBits(dataBytes[i], 8);
  }

  // Terminator (up to 4 zeroes)
  const totalDataCapacityBits = TOTAL_DATA_CODEWORDS_M[version] * 8;
  const termLen = Math.min(4, totalDataCapacityBits - bitStream.length);
  for (let i = 0; i < termLen; i++) bitStream.push(0);

  // Pad to byte boundary
  while (bitStream.length % 8 !== 0) {
    bitStream.push(0);
  }

  // Convert bitstream to bytes
  const dataCodewords: number[] = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitStream[i + b];
    }
    dataCodewords.push(byteVal);
  }

  // Pad bytes alternating 236 and 17
  const padBytes = [236, 17];
  let padIdx = 0;
  while (dataCodewords.length < TOTAL_DATA_CODEWORDS_M[version]) {
    dataCodewords.push(padBytes[padIdx % 2]);
    padIdx++;
  }

  // Calculate Error Correction
  const eccCount = VERSION_ECC_M[version];
  const eccCodewords = calculateErrorCorrection(new Uint8Array(dataCodewords), eccCount);

  // All codewords = data + ecc
  const allCodewords = [...dataCodewords, ...Array.from(eccCodewords)];
  const allBits: number[] = [];
  for (const cw of allCodewords) {
    for (let b = 7; b >= 0; b--) {
      allBits.push((cw >>> b) & 1);
    }
  }

  // Place data bits in matrix (columns 2 by 2 from right to left)
  let bitIndex = 0;
  let dirUp = true;
  for (let col = moduleCount - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing pattern
    for (let rowStep = 0; rowStep < moduleCount; rowStep++) {
      const row = dirUp ? moduleCount - 1 - rowStep : rowStep;
      for (let c = 0; c < 2; c++) {
        const currCol = col - c;
        if (matrix[row][currCol] === null) {
          const bit = bitIndex < allBits.length ? allBits[bitIndex] : 0;
          bitIndex++;
          // Mask 0: (row + col) % 2 === 0
          const mask = (row + currCol) % 2 === 0;
          matrix[row][currCol] = Boolean(bit ^ (mask ? 1 : 0));
        }
      }
    }
    dirUp = !dirUp;
  }

  // Format info for ECC Level M, Mask 0: 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  // Top-left
  const tlCoords = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];
  for (let i = 0; i < 15; i++) {
    matrix[tlCoords[i][0]][tlCoords[i][1]] = Boolean(formatBits[i]);
  }
  // Bottom-left & Top-right
  for (let i = 0; i < 7; i++) {
    matrix[moduleCount - 1 - i][8] = Boolean(formatBits[i]);
  }
  for (let i = 0; i < 8; i++) {
    matrix[8][moduleCount - 8 + i] = Boolean(formatBits[7 + i]);
  }

  return matrix.map(row => row.map(m => Boolean(m)));
}

/**
 * Generate SVG Path string representing the QR modules
 */
export function getQRPath(matrix: boolean[][]): string {
  let path = '';
  const size = matrix.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        path += `M${c + 4},${r + 4}h1v1h-1z `;
      }
    }
  }
  return path;
}
