import { createArticleSchema } from "./article";
import { loginSchema } from "./auth";
import { createFabriquantSchema } from "./fabriquant";
import { createOrderItemsSchema, createOrderSchema } from "./order";
import { createUserSchema } from "./user";

type schemasType = {
  [key: string]: any;
};

const schemas: schemasType = {
  login: loginSchema,
  createUser: createUserSchema,
  createArticle: createArticleSchema,
  createFabriquant: createFabriquantSchema,
  createOrder: createOrderSchema,
  createOrderItems: createOrderItemsSchema,
};

const validator = (schemaName: string) => {
  const schema = schemas[schemaName];
  if (!schemaName || !schema) {
    throw new Error(`Unknown validator schema ${schemaName}`);
  }
  return (body: unknown) => {
    return schema.validate(body, {
      abortEarly: false,
      strict: true,
    });
  };
};
export default validator;
