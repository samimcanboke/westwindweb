import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import './TimePicker.css'; 

const TimePicker = ({ onChange,className,id,name }) => {
  const timePickerRef = useRef(null);

  useEffect(() => {
    if (timePickerRef.current) {
      const fp = flatpickr(timePickerRef.current, {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        minuteIncrement: 15,
        disableMobile: true,
        onClose: onChange,
        onOpen: () => {
          setTimeout(() => {
            const hourInput = fp.calendarContainer.querySelector('.flatpickr-hour');
            const minuteInput = fp.calendarContainer.querySelector('.flatpickr-minute');
            if (hourInput) hourInput.blur();
            if (minuteInput) minuteInput.blur();
          }, 0);
        },
      });
    }
  }, [onChange]);

  return (
    <input type="text"  ref={timePickerRef} placeholder="Zeit wählen" className={className} id={id} name={name} />
  );
};

export default TimePicker;
