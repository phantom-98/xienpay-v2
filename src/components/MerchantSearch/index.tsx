import React, { useState } from 'react';
import type { SelectProps } from 'antd';
import { Select } from 'antd';
import { fetchMerchantsList } from '@/services/ant-design-pro/api';

interface UserValue {
    label: string;
    value: number;
}

const SearchInput: React.FC<{
    placeholder: string;
    style: React.CSSProperties;
    onChange?: (value: UserValue) => void;
  }> = (props) => {
    const [data, setData] = useState<SelectProps['options']>([]);
    const [value, setValue] = useState<number>();
  
    // Ensure that new user ids should also be allowed to be entered here
    // if they were not present in lookup
    const handleSearch = (newValue: string) => {
      return fetchMerchantsList(newValue).then((data: any) => {
        console.log("merchant data", data)
        if (data.length > 0) {
          setData(data);
        } else {
          setData([{ label: newValue, value: newValue }]);
        }
      });
    };
  
    const handleChange = (index: number) => {
      setValue(index);
      data && props.onChange?.(data[index]);
    };
  
    return (
      <Select
        showSearch
        value={value}
        style={props.style}
        placeholder={props.placeholder}
        defaultActiveFirstOption={false}
        suffixIcon={null}
        filterOption={false}
        onSearch={handleSearch}
        onChange={handleChange}
        notFoundContent={null}
        options={(data || []).map((d, index) => ({
          value: index,
          label: d.label,
        }))}
      />
    );
  };

  export default SearchInput;