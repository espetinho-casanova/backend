import prismaClient from "../../prisma";

interface CategoryRequest {
  name: string;
}

class CreateCategoryService {
  async execute({ name }: CategoryRequest) {
    console.log("name: ", name);

    if (name == "") {
      throw new Error("Name invalid");
    }

    const category = await prismaClient.category.create({
      data: {
        categoryName: name,
      },
      select: {
        id: true,
        categoryName: true,
      },
    });

    return category;
  }
}

export { CreateCategoryService };
