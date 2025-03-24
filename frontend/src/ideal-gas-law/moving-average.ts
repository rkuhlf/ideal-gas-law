export class MovingAverage {
    private items: number[] = [];
    private mean: number = 0;

    constructor(public count: number) {}

    public getAverage() {
        // console.log(this.items, this.mean);

        // Adjust so that if we only have a few items it isn't scaled down.
        return this.mean * this.count / this.items.length;
    }

    public addItem(item: number) {
        this.items.push(item);
        this.mean += item / this.count;

        if (this.items.length > this.count) {
            const removed = this.items.shift() || 0;
            this.mean -= removed / this.count
        }
    }
}