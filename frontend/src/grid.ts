type RowCol = {
    row: number;
    col: number;
}

// Grid for storing which particles are where.
export class Grid<T> {
    // TODO: Test performance with array and with set.
    private cells: T[][][]
    // We need this map if we use a set, otherwise when we're given an item to move, we have to look through the list to find where it is.
    // private itemToCell: Map<T, {
    //     row: number;
    //     col: number;
    // }> = new Map();

    constructor(
        public readonly rows: number,
        public readonly cols: number,
        public readonly width: number,
        public readonly height: number) {

        this.cells = [];
        for (let i = 0; i < rows; i++) {
            this.cells.push([]);
            for (let j = 0; j < cols; j++) {
                this.cells[i].push([]);
            }
        }
    }

    public addItem(item: T, x: number, y: number) {
        const rowCol = this.getRowCol(x, y);

        this.cells[rowCol.row][rowCol.col].push(item);
        // this.itemToCell
    }

    public removeItem(item: T, x: number, y: number) {
        const rowCol = this.getRowCol(x, y);

        const cell = this.cells[rowCol.row][rowCol.col];
        cell.splice(cell.findIndex((v: T) => v == item), 1);
    }

    public moveItem(item: T, prevX: number, prevY: number, newX: number, newY: number) {
        this.removeItem(item, prevX, prevY)       
        this.addItem(item, newX, newY)
    }

    // Returns every T item that is at least as close as targetDistance, but might return some that are farther.
    public getNear(x: number, y: number, targetDistance: number): T[] {
        const { row, col } = this.getRowCol(x, y);

        const colWidth = this.width / this.cols;
        const rowHeight = this.height / this.rows;

        const rowOffset = Math.ceil(targetDistance / rowHeight);
        const colOffset = Math.ceil(targetDistance / colWidth);

        const startRow = Math.max(row - rowOffset, 0);
        const endRow = Math.min(row + rowOffset, this.rows - 1);

        const startCol = Math.max(col - colOffset, 0);
        const endCol = Math.min(col + colOffset, this.cols - 1);

        const res: T[] = [];

        // We add the distToCorner everywhere, since we're comparing the distance between the centers of the shapes.
        // This is an approximation, but it should be fairly close.
        const distToCorner = Math.sqrt(colWidth * colWidth + rowHeight * rowHeight) / 2;
        for (let otherRow = startRow; otherRow <= endRow; otherRow++) {
            for (let otherCol = startCol; otherCol <= endCol; otherCol++) {
                const xDist = this.getColCenter(otherCol) - x;
                const yDist = this.getRowCenter(otherRow) - y;
                const dist = Math.sqrt(xDist * xDist + yDist * yDist);
                
                if (dist < targetDistance + distToCorner) {
                    res.push(...this.cells[otherRow][otherCol]);
                }
            }
        }
        
        return res;
    }
    
    private getRowCol(x: number, y: number): RowCol {
        // We add one so that we support items with x=width.
        const row = Math.floor(y / (this.height + 1) * this.rows);
        const col = Math.floor(x / (this.width + 1) * this.cols);

        return { row, col };
    }

    private getColCenter(col: number): number {
        return (col + 0.5) * this.width / this.cols;
    }

    private getRowCenter(row: number): number {
        return (row + 0.5) * this.height / this.rows;
    }
}