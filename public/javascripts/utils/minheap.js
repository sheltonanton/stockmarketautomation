function MinHeap(array, key, comparator){
    this.array = array || [];
    this.key = key;
    this.compare = comparator || this.compare;
    this.build();
}

MinHeap.prototype.build = function () {
    let a = this.array || [];
    for(var i=parseInt((a.length - 2)/2); i >= 0; i--){
        this.heapify(i);
    }
}

MinHeap.prototype.add = function (val) {
    this.array.push(val);
    this.bubbleup(this.array.length - 1);
}

MinHeap.prototype.popmin = function () {
    if(this.array.length == 0){
        return Number.MAX_VALUE;
    }
    if(this.array.length == 1){
        return this.array.pop();
    }
    this.swap(0, this.array.length - 1);
    let min = this.array.pop();
    this.heapify(0);
    return min;
}

MinHeap.prototype.heapify = function (i) {
    let a = this.array || [];
    let l = (2*i) + 1;
    let r = (2*i) + 2;
    let min = i;
    if(l < a.length && (this.compare(this.val(l), this.val(min)) < 0)){
        min = l;
    }
    if (r < a.length && (this.compare(this.val(r), this.val(min)) < 0)){
        min = r;
    }
    if(min != i){
        this.swap(min, i);
        this.heapify(min);
    }
}

MinHeap.prototype.bubbleup = function (i) {
    if(i == 0){
        return;
    }
    let parent = parseInt((i-1)/2);
    if(this.compare(this.val(i), this.val(parent)) < 0){
        this.swap(i, parent);
        this.bubbleup(parent);
    }
}

MinHeap.prototype.val = function (i) {
    return (this.key && this.array[i][this.key]) || this.array[i];
}

MinHeap.prototype.swap = function (i, j) {
    let t = this.array[i];
    this.array[i] = this.array[j];
    this.array[j] = t;
}

MinHeap.prototype.compare = function(a, b){
    return (a - b);
}

module.exports = MinHeap;