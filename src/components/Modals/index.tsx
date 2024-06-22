import { Input, Modal, Select } from 'antd';
import React, { useState } from 'react';

export const ApprovalModal: React.FC<{
  visible: boolean;
  setVisible: (value: boolean) => void;
  Id: string;
  placeholder: string;
  settlement?: boolean;
  style: React.CSSProperties;
  onConfirm?: (method: string, value: string) => void;
}> = (props) => {
  const [inputValue, setInputValue] = useState('');
  const [method, setMethod] = useState('manual');

  const handleOk = () => {
      props.onConfirm?.(method, inputValue);
      props.setVisible(false);
      setMethod('manual');
      setInputValue(''); // Reset input value
  };

  const handleCancel = () => {
    props.setVisible(false);
    setMethod('manual');
    setInputValue(''); // Reset input value
  };

  const handleSelectChange = (value) => {
    setMethod(value);
    value == "eko" && setInputValue(undefined);
  }

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
        width={360}
      >
        {!props.settlement && (
          <Select
            options={[{label: "Manual", value: "manual"}, {label: "Eko", value: "eko"}]}
            value={method}
            onChange={handleSelectChange}
            style={{width: "100%"}}
          />
        )}
        {method == "manual" && (
          <Input
            placeholder="Enter UTR ID"
            width="sm"
            value={inputValue}
            onChange={handleInputChange}
            style={{
              marginBlock: 8,
            }}
          />
        )}
      </Modal>
    </>
  );
};

export const RejectModal: React.FC<{
  visible: boolean;
  setVisible: (value: boolean) => void;
  Id: string;
  // placeholder: string;
  style: React.CSSProperties;
  onConfirm?: (value: string) => void;
}> = (props) => {
  const [value, setValue] = useState('');

  const handleOk = () => {
    if (value && value.length > 0) {
      props.onConfirm?.(value);
      props.setVisible(false);
      setValue(''); // Reset input value
    }
  };

  const handleCancel = () => {
    props.setVisible(false);
    setValue(''); // Reset input value
  };

  const handleChange = (v) => {
    setValue(v);
  };

  return (
    <>
      <Modal
        title={`Confirm Reject for ID. ${props.Id}`}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="OK"
        cancelText="Cancel"
        visible={props.visible}
        centered
        width={360}
      >
        <span>Reason: </span>
        <Select
          defaultValue="insufficient_funds"
          style={{ width: 240, marginLeft: 15, marginBlock: 8 }}
          onChange={handleChange}
          options={[
            { value: 'insufficient_funds', label: 'Insufficient funds' },
            { value: 'invalid_bank_details', label: 'Invalid bank details' },
            { value: 'other', label: 'Others' },
          ]}
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
