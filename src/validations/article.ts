import * as yup from "yup";

export const createArticleSchema = yup.object().shape({
  number: yup.string().required("Réference number is required"),
  quantity: yup.number().required("Quantity is required"),
  exportedAt: yup.date().required("export Date is required"),
  technicienId: yup.string().required("Technicien ID is required"),
});

export type createArticleCredentials = yup.InferType<
  typeof createArticleSchema
>;
