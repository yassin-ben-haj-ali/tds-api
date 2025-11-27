import * as yup from "yup";

export const createFabriquantSchema = yup.object().shape({
  name: yup.string().required("name is required"),
  adress: yup.string().required("adress is required"),
  mailAdress: yup.string().email().required("mailadress is required"),
  telephoneNumber: yup.string().required("telephoneNumber is required"),
  countryCode: yup.string().optional(),
});

export type createFabriquantCredentials = yup.InferType<
  typeof createFabriquantSchema
>;
