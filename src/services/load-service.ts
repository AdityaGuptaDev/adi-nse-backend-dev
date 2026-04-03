class LoadService {
  private requests: number = 0;
  inc = () => this.requests++;
  dec = () => this.requests--;
  status = () => this.requests;
  currentMemory = () => process.memoryUsage();
}

export default new LoadService();
