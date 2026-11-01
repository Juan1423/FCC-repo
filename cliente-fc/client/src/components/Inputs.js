import React from 'react';
import { TextField, Autocomplete, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { MuiTelInput } from "mui-tel-input";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";

dayjs.locale("en-gb");


const TextInput = ({ label, name, value, onChange, error, helperText, disabled, onBlur }) => (
    <TextField
      label={label}
      fullWidth
      name={name}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      error={!!error}
      helperText={helperText}
      disabled={disabled}
    />
  );
  
  const AutocompleteInput = ({ label, options, value, onChange, error, helperText, onBlur }) => {
    // Find the option object that matches the current value
    const selectedOption = options.find((option) => option.value === value) || null;
  
    const handleChange = (event, newValue) => {
      // Call the onChange function with the new value (or null if cleared)
      onChange(newValue ? newValue.value : null);
    };
  
    return (
      <Autocomplete
        disablePortal
        options={options}
        value={selectedOption}
        onChange={handleChange}
        onBlur={onBlur}
        sx={{ width: "100%" }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={!!error}
            helperText={helperText}
          />
        )}
      />
    );
  };
  
  const FileInput = ({ onChange, value, onRemove, disabled, inputName }) => {
    const handleChange = (event) => {
      if (event.target.files && event.target.files[0]) {
        onChange(event.target.files[0]);
      }
    };
  
    const getFileName = (fileData) => {
      if (fileData instanceof File) {
        return fileData.name;
      } else if (typeof fileData === 'string') {
        return fileData.split('/').pop();
      }
      return 'No file selected';
    };
  
    return (
      <div>
        <input
          accept="image/*,.pdf"
          style={{ display: "none" }}
          id={`contained-button-file-${inputName}`}
          type="file"
          onChange={handleChange}
          disabled={disabled}
        />
        <label htmlFor={`contained-button-file-${inputName}`}>
          <Button variant="contained" color="primary" component="span" disabled={disabled}>
            {inputName || "Subir archivo"}
          </Button>
        </label>
        {value && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
            <Typography variant="subtitle1">{getFileName(value)}</Typography>
            <IconButton aria-label="delete" onClick={onRemove} color="secondary" size="small">
              <CloseIcon />
            </IconButton>
          </div>
        )}
      </div>
    );
  };
  
  
  const PhoneInput = ({ label, name, value, onChange, error, helperText, onBlur }) => (
    <MuiTelInput
      fullWidth
      label={label}
      name={name}
      defaultCountry="EC"
      onChange={(value) => onChange({ target: { name, value } })}
      value={value}
      onBlur={onBlur}
      error={!!error}
      helperText={helperText}

    />
  );
  
  const DateInput = ({ label, value, onChange, error, helperText }) => {
    const handleChange = (newValue) => {
        onChange(newValue);
      };
      return(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={handleChange}
        maxDate={dayjs()}
        slotProps = {{textField: {fullWidth: true, error: !!error, helperText: helperText}}}

      />
    </LocalizationProvider>
    );
    };

    const TextareaInput = ({ 
      label, 
      name, 
      value, 
      onChange, 
      error, 
      helperText, 
      disabled, 
      onBlur,
      rows = 4,
      maxRows
    }) => (
      <TextField
        label={label}
        fullWidth
        multiline
        name={name}
        // Evita el warning de MUI "value prop on textarea should not be null":
        // los inputs controlados esperan string, no null.
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        error={!!error}
        helperText={helperText}
        disabled={disabled}
        rows={rows}
        {...(maxRows ? { maxRows } : {})}
      />
    );

export { DateInput, TextInput, PhoneInput, AutocompleteInput, FileInput, TextareaInput};
