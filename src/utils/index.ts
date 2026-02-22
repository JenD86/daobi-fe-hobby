import { JsonFragmentType } from "@ethersproject/abi";

export function toTrimmedAddress(value: string) {
  if (!value) return "";
  return (
    value.substr(0, 6) + "…" + value.substr(value.length - 4, value.length)
  );
}

export function formatIODefaultValues(
  inputs: readonly JsonFragmentType[],
  address?: string
) {
  return inputs?.map((input) => {
    let value;

    switch (input.type) {
      case "address":
        value = "";
        break;
      case "string":
        value = "";
        break;
      case "bool":
        value = false;
        break;

      default:
        if (input.type.includes("int")) value = "0.00";
        else if (input.type.includes("fixed")) value = 0.0;
        else if (input.type.includes("bytes")) value = "";
        else console.log(`Unknown Type: ${JSON.stringify(input)}`);
        break;
    }

    return { value, ...input };
  });
}
