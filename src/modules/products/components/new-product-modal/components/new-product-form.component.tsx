import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Select,
  Alert,
  Flex,
  Text,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_PRODUCT } from "../../../../../graphql/queries/createProduct.query";
import { PreviewImageNewProduct } from "./preview-image-new-product/preview-image-new-product.component";
import { Category } from "../../../../shared/core/interfaces";
import { GET_CATEGORIES } from "../../../../../graphql/queries/getCategories.query";

interface ProductFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSuccess,
  onClose,
}) => {
  const [
    createProduct,
    { loading: loadingCreateProduct, error: errorCreateProduct },
  ] = useMutation(CREATE_PRODUCT);
  const {
    loading: loadingCategories,
    error: errorCategories,
    data: categoriesData,
  } = useQuery<{ categories: Category[] }>(GET_CATEGORIES);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      price: 0,
      SKU: "",
      image: null as string | ArrayBuffer | null,
      description: "",
      categoryId: "",
    },
    validate: {
      name: (value) =>
        value.trim().length === 0 ? "Product name is required" : null,
      price: (value) => (value <= 0 ? "Price must be greater than zero" : null),
      SKU: (value) => (value.trim().length === 0 ? "SKU is required" : null),
      image: (value) => (!value ? "Image is required" : null),
      categoryId: (value) =>
        value.trim().length === 0 ? "Category is required" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setSuccess(false);
    try {
      const imageBase64 = values.image;
      await createProduct({
        variables: {
          input: { ...values, image: imageBase64 },
        },
      });

      form.reset();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error creating product:", err);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Text size="md" fw={400}>
        Seleccione una imagen
      </Text>
      {/* PREVIEW IMAGE */}
      <Flex justify="center" align="center" p={25}>
        <PreviewImageNewProduct
          value={form.values.image}
          onChange={(base64: string | ArrayBuffer | null) =>
            form.setFieldValue("image", base64)
          }
        />
        {form.errors.image && <Alert color="red">{form.errors.image}</Alert>}
      </Flex>

      <TextInput
        label="Nombre del Producto"
        placeholder="e.g., Sample Product"
        withAsterisk
        {...form.getInputProps("name")}
      />
      <NumberInput
        label="Precio"
        placeholder="e.g., 100"
        withAsterisk
        {...form.getInputProps("price")}
      />
      <TextInput
        label="SKU"
        placeholder="e.g., PRODUCT01"
        withAsterisk
        {...form.getInputProps("SKU")}
      />

      <TextInput
        label="Descripción"
        placeholder="Describe el producto"
        {...form.getInputProps("description")}
      />

      <Flex>
        {loadingCategories ? (
          <Loader color="blue" />
        ) : errorCategories ? (
          <Alert title="Error" color="red" mt="lg">
            No se pudieron cargar las categorías. Por favor, recargue la página.
          </Alert>
        ) : (
          <Select
            w="100%"
            label="Categoría"
            placeholder="Selecciona una categoría"
            withAsterisk
            data={
              categoriesData && categoriesData.categories
                ? categoriesData.categories.map((category) => ({
                    value: category.categoryId,
                    label: category.name,
                  }))
                : []
            }
            {...form.getInputProps("categoryId")}
          />
        )}
      </Flex>

      <Button type="submit" fullWidth mt="lg" loading={loadingCreateProduct}>
        Crear Producto
      </Button>

      {success && (
        <Alert title="Éxito" color="green" mt="lg">
          Producto creado con éxito.
        </Alert>
      )}
      {errorCreateProduct && (
        <Alert title="Error" color="red" mt="lg">
          {errorCreateProduct.message}
        </Alert>
      )}
    </form>
  );
};
