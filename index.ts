class State {
  constructor(
    public readonly exclCols: Set<number> = new Set(),
    public readonly exclCell: Set<number> = new Set(),
    public queenCount = 0,
    public row: number = 0
  ) {

  }

  getVacantCells(board: Board): number[] {
    const vacant = [];
    for (let i = 0; i < board.size; i++) {
      if (this.exclCols.has(i)) {
        continue;
      }

      const cell = board.convertIndex(i, this.row);

      if (this.exclCell.has(cell)) {
        continue;
      }

      vacant.push(cell);
    }
    return vacant;
  }

  clone(): State {
    const exclCols = new Set(this.exclCols);
    const exclCell = new Set(this.exclCell);
    return new State(exclCols, exclCell, this.queenCount, this.row);
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

    clonedState.exclCols.add(x);

    for (let k = 1; k < this.size; k++) {
      const y1 = y + k;

      if (y1 === this.size) {
        break;
      }

      const x1 = x + k;
      const x2 = x - k;

      if (x1 < this.size) {
        clonedState.exclCell.add(this.convertIndex(x1, y1));
      }

      if (x2 >= 0) {
        clonedState.exclCell.add(this.convertIndex(x2, y1));
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

function findSolutions(boardSize: number): [number, Board[]] {
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

  return [i, solutions];
}

const [n, solutions] = findSolutions(8);
console.log(`${n} - ${solutions.length}`);
