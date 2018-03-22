const BAY_LENGTH = 1.2;

export default class Structure {

  constructor() {
    this.bays = [];
    this.width = 10;
  }

  get footprint() {
    return (this.bays.length * BAY_LENGTH) * width;
  }

}
