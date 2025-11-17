import * as yup from "yup";

export const createUserSchema = yup.object().shape({
  email: yup.string().email().required("Email is required"),
  password: yup.string().required("Password is required"),
  name: yup.string().required("Name is required"),
  phone: yup.string().required("Phone is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

export type createUserCredentials = yup.InferType<typeof createUserSchema>;