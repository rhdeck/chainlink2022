export class ChainlinkVariable {
  public name: string;
  public wrapInQuotes: boolean;
  constructor(name: string, wrap: boolean = false) {
    this.name = name;
    this.wrapInQuotes = wrap;
  }
  toString: () => string = () => {
    if (this.wrapInQuotes) {
      return `"$(${this.name})"`;
    } else {
      return `$(${this.name})`;
    }
  };
}
