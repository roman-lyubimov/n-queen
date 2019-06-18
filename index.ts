class State {
  constructor(
    public readonly exclCols: number[] = [],
    public readonly exclCell: number[] = [],
    public readonly boardSize: number = 8,
    public queenCount = 0,
    public row: number = 0
  ) {
    if (!exclCols.length) {
      for (let i = 0; i < boardSize; i++) {
        exclCols.push(0);
      }
    }

    if (!exclCell.length) {
      for (let i = 0; i < (boardSize * boardSize); i++) {
        exclCell.push(0);
      }
    }
  }

  getVacantCells(board: Board): number[] {
    const vacant = [];
    for (let i = 0; i < board.size; i++) {
      if (this.exclCols[i] === 1) {
        continue;
      }

      const cell = board.convertIndex(i, this.row);

      if (this.exclCell[cell] === 1) {
        continue;
      }

      vacant.push(cell);
    }
    return vacant;
  }

  clone(): State {
    const exclCols = ([] as number[]).concat(this.exclCols); // TS2345
    const exclCell = ([] as number[]).concat(this.exclCell); // TS2345
    return new State(exclCols, exclCell, this.boardSize, this.queenCount, this.row);
  }
}

class Board {
  constructor(
    public readonly size: number,
    public readonly cells: number[] = []
  ) {
    if (cells.length === 0) {
      for (let i = 0; i < size * size; i++) {
        cells.push(0);
      }
    }
  }

  get length(): number {
    return this.size * this.size;
  }

  addQueen(i: number, s: State): State {
    this.cells[i] = 1;

    const clonedState = s.clone();
    clonedState.queenCount += 1;

    const [x, y] = this.convertXY(i);

    clonedState.exclCols[x] = 1;

    for (let k = 1; k < this.size; k++) {
      const y1 = y + k;

      if (y1 === this.size) {
        break;
      }

      const x1 = x + k;
      const x2 = x - k;

      if (x1 < this.size) {
        clonedState.exclCell[this.convertIndex(x1, y1)] = 1;
      }

      if (x2 >= 0) {
        clonedState.exclCell[this.convertIndex(x2, y1)] = 1;
      }
    }

    return clonedState;
  }

  get(x: number, y: number): number {
    return this.cells[this.size * y + x];
  }

  at(i: number): number {
    return this.cells[i];
  }

  clone(): Board {
    const cells = ([] as number[]).concat(this.cells); // TS2345
    return new Board(this.size, cells);
  }

  convertXY(i: number): [number, number] {
    const y = Math.floor(i / this.size);
    return [i % this.size, y];
  }

  convertIndex(x: number, y: number): number {
    return y * this.size + x;
  }

  toString(): string {
    let s = '';

    for (let i = 0; i < this.length; i++) {
      s += this.cells[i] + ((((i + 1) % this.size) === 0) ? "\n" : ' ');
    }

    return s;
  }
}

function findSolutions(boardSize: number): [number, Board[], number] {
  const startTime = process.hrtime();

  const stack: {
    board: Board;
    state: State;
    vacant?: number[];
  }[] = [];

  stack.push({
    board: new Board(boardSize),
    state: new State()
  });

  const solutions: Board[] = [];
  let i = 0;

  while (stack.length) {
    i++;

    const entry = stack[stack.length - 1];
    let {board, state, vacant} = entry;

    if (vacant === undefined) {
      vacant = entry.vacant = state.getVacantCells(board);
    }

    if (vacant.length === 0) {
      stack.splice(-1, 1);
      continue;
    }

    const cell = vacant.splice(-1, 1);

    board = board.clone();
    state = board.addQueen(cell[0], state);

    if (state.row === (boardSize - 1)) {
      solutions.push(board);
      stack.splice(-1, 1);
      continue;
    }

    state.row += 1;

    stack.push({board, state});
  }

  const diffTime = process.hrtime(startTime);

  return [i, solutions, diffTime[0] * 1e9 + diffTime[1]];
}

const [n, solutions, elapsed] = findSolutions(8);
console.log(`${n} - ${solutions.length}(${elapsed / 1e6}ms)`);
