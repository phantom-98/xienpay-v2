import React from 'react';

const TimeSelection: React.FC = ({value, setValue, options}) => {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        gap: "12px"
      }}>
        {options.map((option) => {
            return (
                <div style={{
                    borderRadius: "12px",
                    border: "1px solid #dfdfdf",
                    padding: "8px",
                    width: "52px",
                    textAlign: "center",
                    background: value == option.value || value == option ? "#639f52":"transparent",
                    color: value == option.value || value == option ? "white":"black",
                    cursor: "pointer"
                }} onClick={() => {
                    setValue && setValue(option.value ?? option);
                }}>{option.title ?? option}</div>
            )
        })}
      </div>
    );
  };
  
export default TimeSelection;