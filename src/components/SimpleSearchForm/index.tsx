import React from 'react';
import styled from 'styled-components';
import {SearchOutlined} from '@ant-design/icons'

const SimpleSearchForm: React.FC = ({value, setValue, onEditFinished, onClickIcon, onClickAdvanced}) => {
    return (
        <>
            <SearchWrapper>
                <input
                    placeholder="Search here"
                    value={value} 
                    onChange={ e => setValue && setValue(e.target.value)}
                    onKeyDown={ e => {
                        if (e.key === "Enter") {
                            onEditFinished && onEditFinished();
                        }
                    }}
                />
                <SearchOutlined onClick={() => onClickIcon && onClickIcon()} style={{ fontSize: '20px', color: '#979797', cursor: 'pointer' }} />
            </SearchWrapper>
            <AdvancedSearch onClick={() => onClickAdvanced && onClickAdvanced()}>Advanced search</AdvancedSearch>
        </>
    );
  };
  
  export default SimpleSearchForm;

  const SearchWrapper = styled.div`
    background: #f4f7fe;
    border-radius: 20px;
    padding: 8px 16px;
    display: flex;
    align-items: center

    $:hover {
        border: 1px solid #639f52;
    }

    & input {
        background: transparent;
        border: none;
        outline: none;
    }
  `;

  const AdvancedSearch = styled.span`
    margin-left: 12px;
    color: #639f52;
    cursor: pointer;
    font-size: 12px;
    text-decoration: underline;
  `;