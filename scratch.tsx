import React, { useState } from "react";

function TestComp({ onChange }: { onChange: (val: string) => void }) {
    return <button onClick={() => onChange("hello")}>click</button>
}

export function App() {
    const [, setVal] = useState("");
    return <TestComp onChange={setVal} />
}
