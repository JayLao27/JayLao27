declare module "*.json" {
  type Year = import("./site").Year;

  const value: {
    years: Year[];
    contributions: number;
  };

  export default value;
}
