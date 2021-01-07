import { useState } from "react";

export const useForm = (callback, initialState = {}) => {
  const [values, setValues] = useState(initialState);

  const onChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  //   const handlePhoto = (e) => {
  //     setValues({...values, photo: e.target.files[0]});
  // }

  const onSubmit = (event) => {
    event.preventDefault();
    // const formData = new FormData();
    // formData.append("photo", newPhoto.photo);
    callback();
  };

  return {
    onChange,
    onSubmit,
    values,
  };
};
