import * as yup from "yup";

export const createUserSchema = yup.object().shape({
  mailAdress: yup.string().email().required("Email is required"),
  firstName: yup.string().required("Name is required"),
  lastName: yup.string().required("lastName is required"),
  phone: yup.string().required("Phone is required"),
  role: yup.string().required("Role is required"),
  // password: yup.string().required("Password is required"),
  // confirmPassword: yup
  //   .string()
  //   .oneOf([yup.ref("password")], "Passwords must match")
  //   .required("Confirm Password is required"),
});

export type createUserCredentials = yup.InferType<typeof createUserSchema>;
