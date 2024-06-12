import React, { useState } from "react";
import { Input, Modal } from 'antd';

export const ApprovalModal: React.FC<{
    visible: boolean;
    setVisible: (value: boolean) => void;
    Id: string;
    placeholder: string;
    style: React.CSSProperties;
    onConfirm?: (value: string) => void;
  }> = (props) => {
    const [inputValue, setInputValue] = useState('');
  
    const handleOk = () => {
      if (inputValue && inputValue.length > 0) {
        props.onConfirm?.(inputValue);
        props.setVisible(false);
        setInputValue(''); // Reset input value
      }
    };
  
    const handleCancel = () => {
      props.setVisible(false);
      setInputValue(''); // Reset input value
    };
  
    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };
  
    return (
      <>
        <Modal
          title={`Confirm Approval for ID. ${props.Id}`}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="OK"
          cancelText="Cancel"
          visible={props.visible}
          centered
          width={400}
        >
          <Input
            placeholder="Enter UTR ID"
            width="sm"
            value={inputValue}
            onChange={handleInputChange}
          />
        </Modal>
      </>
    );
  };

export const ConfirmModal: React.FC<{
    visible: boolean;
    setVisible: (value: boolean) => void;
    Id: string;
    title: string;
    description: string;
    onConfirm?: () => void;
  }> = (props) => {
  
    const handleOk = () => {
        props.onConfirm?.();
        props.setVisible(false);
    };
  
    const handleCancel = () => {
      props.setVisible(false);
    };
  
    return (
      <>
        <Modal
          title={`${props.title} ${props.Id}`}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="OK"
          cancelText="Cancel"
          visible={props.visible}
          centered
          width={400}
        >
          {props.description}
        </Modal>
      </>
    );
  };