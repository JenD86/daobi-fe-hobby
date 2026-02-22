import { JsonFragmentType } from "@ethersproject/abi";
import { ChangeEvent, Dispatch, SetStateAction } from "react";
interface Props {
  input: {
    json: JsonFragmentType;
    userFriendlyCopy: string;
  };
  value: any;
  idx: number;
  formData: any[] | number;
  setFormData: Dispatch<SetStateAction<any[] | number>>;
  isMsgValue: boolean;
}

const inputStyle =
  "w-full p-2 rounded-lg border-2 border-color-mode focus:outline-1 focus:outline-blue-400";

const Input = ({
  input,
  value,
  idx,
  formData,
  setFormData,
  isMsgValue,
}: Props) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isMsgValue) {
      let newData = formData;
      newData[idx].value = e.currentTarget.value;
      setFormData(() => [...(newData as any[])]);
    } else {
      setFormData(() => Number(e.currentTarget.value));
    }
  };

  // field for each input based on type
  const renderInput = () => {
    switch (input.json.type) {
      case "address":
      // fallthrough
      case "string":
        return (
          <input
            className={inputStyle}
            type="text"
            value={value}
            onChange={(e) => handleChange(e)}
          />
        );
      case "bool":
        return (
          <input
            className={inputStyle}
            type="checkbox"
            value={value}
            onChange={(e) => handleChange(e)}
          />
        );

      default:
        if (input.json.type.includes("int")) {
          return (
            <input
              className={inputStyle}
              type="number"
              value={value}
              min="0.00"
              step="1"
              onChange={(e) => handleChange(e)}
            />
          );
        } else if (input.json.name === "_name") {
          // username
          return (
            <input
              className={inputStyle}
              type="text"
              maxLength={31}
              value={value}
              onChange={(e) => handleChange(e)}
            />
          );
        } else if (input.json.type.includes("bytes")) {
          return (
            <input
              className={inputStyle}
              type="text"
              value={value}
              onChange={(e) => handleChange(e)}
            />
          );
        } else {
          return <p>Error, UnknownType</p>;
        }
    }
  };

  return (
    <div className="flex flex-col mb-2">
      <label className="text-center whitespace-pre-line">
        {`${input.userFriendlyCopy}: `}
        {input.json.type.includes("int") && isMsgValue && (
          <p className="italic">
            Note: Will be converted to Wei; 1 = 1 ETH = 10^18 WEI
          </p>
        )}
        {renderInput()}
        <br />
        {input.json.name === "amount" && (
          <p className="italic">
            {`Notice: Large amounts (50,000+) may fail. It is recommended to split large sums into multiple transactions.`}
          </p>
        )}
        {input.json.name === "_name" && (
          <p className="italic">
            {`Note: If you wish to be able to exert your powers in the Discord server if you're elected chancellor, set your discord tag as your official name. Example: User#1234`}
          </p>
        )}
      </label>
    </div>
  );
};

export default Input;
