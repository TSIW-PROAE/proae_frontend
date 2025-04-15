import { useState } from "react";
import "./App.css";
import Select from "./components/ui/Select.jsx";

export default function App() {
  const [selectedOption, setSelectedOption] = useState("");

  const options = [
    { label: "Option One", value: "option1" },
    { label: "Option Two", value: "option2" },
    { label: "Option Three", value: "option3" },
  ];

  return (
    <div className="p-8 space-y-4 w-486">
      <Select
        label="Select an option"
        value={selectedOption}
        onChange={setSelectedOption}
        options={options}
        placeholder="Choose something..."
      />
    </div>
  );
};