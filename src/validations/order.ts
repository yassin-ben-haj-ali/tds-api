import * as yup from "yup";

export const createOrderSchema = yup.object().shape({
  articleId: yup.string().required("Article id is required"),
  fabriquantId: yup.string().required("fabriquant id is required"),
});

export type createOrderCredentials = yup.InferType<typeof createOrderSchema>;
