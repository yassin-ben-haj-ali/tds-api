import * as yup from "yup";

export const createOrderSchema = yup.object().shape({
  articleId: yup.string().required("Article id is required"),
  fabriquantId: yup.string().required("fabriquant id is required"),
  technicienId: yup.string().required("technicien id is required"),
});

export type createOrderCredentials = yup.InferType<typeof createOrderSchema>;

export const createOrderItemsSchema = yup.object().shape({
  orderId: yup.string().required("order id is required"),
  quantity: yup.number().required("quantity id is required"),
});

export type createOrderItemsCredentials = yup.InferType<
  typeof createOrderItemsSchema
>;
