import * as yup from "yup";

export const createUserSchema = yup.object().shape({
  mailAdress: yup.string().email().required("Email is required"),
  firstName: yup.string().required("Name is required"),
  lastName: yup.string().required("lastName is required"),
  telephoneNumber: yup.string().required("telephoneNumber is required"),
  countryCode: yup.string().optional(),
  role: yup.string().required("Role is required"),
});

export type createUserCredentials = yup.InferType<typeof createUserSchema>;
