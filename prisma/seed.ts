import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// Login do admin: usar variável de ambiente em produção ou padrão "admin" para desenvolvimento
const ADMIN_LOGIN = process.env.ADMIN_LOGIN || "admin";

// Senha do admin: usar variável de ambiente em produção ou padrão "123" para desenvolvimento
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123";

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // ============================================
  // 1. LIMPEZA DO BANCO DE DADOS
  // ============================================
  console.log("🗑️  Limpando dados existentes...");

  // Ordem correta para evitar erros de chave estrangeira
  await prisma.orderItemAddon.deleteMany({});
  console.log("   ✓ OrderItemAddon limpo");

  await prisma.orderItem.deleteMany({});
  console.log("   ✓ OrderItem limpo");

  await prisma.order.deleteMany({});
  console.log("   ✓ Order limpo");

  await prisma.productIngredient.deleteMany({});
  console.log("   ✓ ProductIngredient limpo");

  await prisma.productAddon.deleteMany({});
  console.log("   ✓ ProductAddon limpo");

  await prisma.product.deleteMany({});
  console.log("   ✓ Product limpo");

  await prisma.addon.deleteMany({});
  console.log("   ✓ Addon limpo");

  await prisma.ingredient.deleteMany({});
  console.log("   ✓ Ingredient limpo");

  await prisma.category.deleteMany({});
  console.log("   ✓ Category limpo");

  await prisma.rolePermission.deleteMany({});
  console.log("   ✓ RolePermission limpo");

  await prisma.permission.deleteMany({});
  console.log("   ✓ Permission limpo");

  await prisma.role.deleteMany({});
  console.log("   ✓ Role limpo");

  await prisma.user.deleteMany({});
  console.log("   ✓ User limpo\n");

  // ============================================
  // 2. CRIAR PERMISSÕES
  // ============================================
  console.log("🔐 Criando permissões...");

  const permissions = [
    // Cardápio (Produtos) permissions
    { name: "product.view", resource: "product", action: "view", description: "Visualizar cardápio (tela de produtos)" },
    { name: "product.create", resource: "product", action: "create", description: "Criar produtos no cardápio" },
    { name: "product.edit", resource: "product", action: "edit", description: "Editar produtos no cardápio" },
    { name: "product.delete", resource: "product", action: "delete", description: "Deletar produtos do cardápio" },
    { name: "product.toggle_availability", resource: "product", action: "toggle_availability", description: "Alterar disponibilidade de produtos (cardápio)" },
    { name: "product.update_stock", resource: "product", action: "update_stock", description: "Atualizar estoque de produtos (cardápio)" },

    // Categorias permissions
    { name: "category.view", resource: "category", action: "view", description: "Visualizar categorias" },
    { name: "category.create", resource: "category", action: "create", description: "Criar categorias" },
    { name: "category.edit", resource: "category", action: "edit", description: "Editar categorias" },
    { name: "category.delete", resource: "category", action: "delete", description: "Deletar categorias" },

    // Ingredientes permissions
    { name: "ingredient.view", resource: "ingredient", action: "view", description: "Visualizar ingredientes" },
    { name: "ingredient.create", resource: "ingredient", action: "create", description: "Criar ingredientes" },
    { name: "ingredient.edit", resource: "ingredient", action: "edit", description: "Editar ingredientes" },
    { name: "ingredient.delete", resource: "ingredient", action: "delete", description: "Deletar ingredientes" },

    // Adicionais permissions
    { name: "addon.view", resource: "addon", action: "view", description: "Visualizar adicionais" },
    { name: "addon.create", resource: "addon", action: "create", description: "Criar adicionais" },
    { name: "addon.edit", resource: "addon", action: "edit", description: "Editar adicionais" },
    { name: "addon.delete", resource: "addon", action: "delete", description: "Deletar adicionais" },

    // Dashboard (Pedidos) permissions
    { name: "order.view", resource: "order", action: "view", description: "Visualizar pedidos (dashboard)" },
    { name: "order.create", resource: "order", action: "create", description: "Criar pedidos (PDV)" },
    { name: "order.edit", resource: "order", action: "edit", description: "Editar pedidos (dashboard)" },
    { name: "order.update_status", resource: "order", action: "update_status", description: "Atualizar status de pedidos (dashboard)" },
    { name: "order.finish", resource: "order", action: "finish", description: "Finalizar pedidos (dashboard)" },

    // Funcionários permissions
    { name: "user.view", resource: "user", action: "view", description: "Visualizar funcionários" },
    { name: "user.create", resource: "user", action: "create", description: "Criar funcionários" },
    { name: "user.edit", resource: "user", action: "edit", description: "Editar funcionários" },
    { name: "user.delete", resource: "user", action: "delete", description: "Deletar funcionários" },

    // Cargos permissions
    { name: "role.view", resource: "role", action: "view", description: "Visualizar cargos e permissões" },
    { name: "role.create", resource: "role", action: "create", description: "Criar cargos e permissões" },
    { name: "role.edit", resource: "role", action: "edit", description: "Editar cargos e permissões" },
    { name: "role.delete", resource: "role", action: "delete", description: "Deletar cargos e permissões" },
  ];

  const createdPermissions: { [key: string]: string } = {};

  for (const perm of permissions) {
    const permission = await prisma.permission.create({
      data: perm,
    });
    createdPermissions[perm.name] = permission.id;
    console.log(`   ✓ ${perm.name}`);
  }

  // ============================================
  // 3. CRIAR ROLE DE ADMIN
  // ============================================
  console.log("\n👑 Criando role de Admin...");

  const adminRole = await prisma.role.create({
    data: {
      name: "Admin",
      description: "Administrador com acesso total ao sistema",
      permissions: {
        create: Object.values(createdPermissions).map((permissionId) => ({
          permissionId,
        })),
      },
    },
  });

  console.log(`   ✓ Role criado: ${adminRole.name} com todas as permissões`);

  // ============================================
  // 3.1. CRIAR ROLE DE GARÇOM
  // ============================================
  console.log("\n👔 Criando role de Garçom...");

  const garcomPermissions = [
    // Cardápio: visualizar categorias e produtos, alterar disponibilidade
    createdPermissions["category.view"],
    createdPermissions["product.view"],
    createdPermissions["product.toggle_availability"],
    // Dashboard: todas as permissões de pedidos
    createdPermissions["order.view"],
    createdPermissions["order.create"],
    createdPermissions["order.edit"],
    createdPermissions["order.update_status"],
    createdPermissions["order.finish"],
  ];

  const garcomRole = await prisma.role.create({
    data: {
      name: "Garçom",
      description: "Garçom com acesso ao cardápio (visualizar categorias, produtos e alterar disponibilidade) e todas as funcionalidades de pedidos",
      permissions: {
        create: garcomPermissions.map((permissionId) => ({
          permissionId,
        })),
      },
    },
  });

  console.log(`   ✓ Role criado: ${garcomRole.name} com ${garcomPermissions.length} permissões\n`);

  // ============================================
  // 4. CRIAR USUÁRIO ADMIN
  // ============================================
  console.log("👤 Criando usuário admin...");

  const passwordHash = await hash(ADMIN_PASSWORD, 8);

  const user = await prisma.user.create({
    data: {
      name: "Garçom Chefe",
      login: ADMIN_LOGIN,
      password: passwordHash,
      roleId: adminRole.id,
    },
  });

  console.log(`   ✓ Usuário criado: ${user.name} (login: ${user.login}) com role Admin\n`);

  // ============================================
  // 5. CRIAR INGREDIENTES
  // ============================================
  console.log("🥬 Criando ingredientes...");

  const ingredientes = [
    "Pão",
    "Pão d'água",
    "Pão de Xis",
    "Hambúrguer 180g",
    "Maionese",
    "Queijo",
    "Alface",
    "Tomate",
    "Cebola",
  ];

  const createdIngredients: { [key: string]: number } = {};

  // Define quais ingredientes NÃO são removíveis (essenciais)
  const nonRemovableIngredients = ["Pão", "Pão d'água", "Pão de Xis", "Hambúrguer 180g"];

  for (const nome of ingredientes) {
    const isNonRemovable = nonRemovableIngredients.includes(nome);

    const ingredient = await prisma.ingredient.create({
      data: {
        name: nome,
        nonRemovable: isNonRemovable, // Pão não pode ser removido (true), outros sim (false)
        // Ingredientes não têm estoque (apenas produtos têm)
      },
    });
    createdIngredients[nome] = ingredient.id;
    console.log(`   ✓ ${nome} ${isNonRemovable ? "(não removível)" : "(removível)"}`);
  }

  // ============================================
  // 6. CRIAR ADICIONAIS
  // ============================================
  console.log("\n➕ Criando adicionais...");

  const adicionais = [
    { name: "Ovo", price: 2.0 },
  ];

  const createdAddons: { [key: string]: number } = {};

  for (const adicional of adicionais) {
    const addon = await prisma.addon.create({
      data: {
        name: adicional.name,
        price: adicional.price,
      },
    });
    createdAddons[adicional.name] = addon.id;
    console.log(`   ✓ ${adicional.name} - R$ ${adicional.price.toFixed(2)}`);
  }

  // ============================================
  // 7. CRIAR CATEGORIAS E PRODUTOS
  // ============================================

  // ------------------------------
  // CATEGORIA 1: ESPETINHOS
  // ------------------------------
  console.log("\n🍖 Criando categoria: Espetinhos");

  const categoryEspetinhos = await prisma.category.create({
    data: {
      categoryName: "Espetinhos",
    },
  });

  const espetinhos = [
    { name: "Espeto de Carne", price: 15.0 },
    { name: "Espeto Misto", price: 15.0 },
    { name: "Espeto de Coração", price: 15.0 },
    { name: "Espeto de Frango", price: 15.0 },
    { name: "Espeto Salsichão", price: 15.0 },
    { name: "Espeto Suíno", price: 15.0 },
  ];

  // Espetinhos que podem ser usados no lanche (Xis/Ká) - são espetinhos de carne, têm ponto
  const espetinhosUsaveisNoLanche = [
    { name: "Carne", price: 20.0, canBeUsedInSandwich: true, hasMeatPoint: true },
    { name: "Misto", price: 20.0, canBeUsedInSandwich: true, hasMeatPoint: true },
    { name: "Coração", price: 20.0, canBeUsedInSandwich: true, hasMeatPoint: true },
    { name: "Frango", price: 20.0, canBeUsedInSandwich: true, hasMeatPoint: true },
    { name: "Salsichão", price: 20.0, canBeUsedInSandwich: true, hasMeatPoint: true },
    { name: "Suíno", price: 20.0, canBeUsedInSandwich: true, hasMeatPoint: true },
  ];

  // Espetinhos que NÃO podem ser usados no lanche - não são de carne, não têm ponto
  const espetinhosNaoUsaveisNoLanche = [
    {
      name: "Queijo no Palito",
      price: 9.0,
      desc: "Queijo empanado crocante",
      canBeUsedInSandwich: false,
      hasMeatPoint: false,
    },
    {
      name: "Pão de Alho",
      price: 9.0,
      desc: "Pão francês com manteiga de alho",
      canBeUsedInSandwich: false,
      hasMeatPoint: false,
    },
  ];

  for (const espeto of espetinhosUsaveisNoLanche) {
    await prisma.product.create({
      data: {
        name: espeto.name,
        price: espeto.price,
        description: `Delicioso ${espeto.name.toLowerCase()} grelhado`,
        available: true,
        stock: 999, // Estoque padrão para espetos
        categoryId: categoryEspetinhos.id,
        canBeUsedInSandwich: espeto.canBeUsedInSandwich,
        hasMeatPoint: espeto.hasMeatPoint,
        // Espetinhos não têm ingredientes removíveis
      },
    });
    console.log(`   ✓ ${espeto.name} - R$ ${espeto.price.toFixed(2)} (pode usar no lanche, tem ponto da carne)`);
  }

  for (const espeto of espetinhosNaoUsaveisNoLanche) {
    await prisma.product.create({
      data: {
        name: espeto.name,
        price: espeto.price,
        description: espeto.desc,
        available: true,
        stock: 999, // Estoque padrão
        categoryId: categoryEspetinhos.id,
        canBeUsedInSandwich: espeto.canBeUsedInSandwich,
        hasMeatPoint: espeto.hasMeatPoint,
      },
    });
    console.log(`   ✓ ${espeto.name} - R$ ${espeto.price.toFixed(2)} (não pode usar no lanche, sem ponto da carne)`);
  }

  // ------------------------------
  // CATEGORIA 3: LANCHES
  // ------------------------------
  console.log("\n🍔 Criando categoria: Lanches");

  const categoryLanches = await prisma.category.create({
    data: {
      categoryName: "Lanches",
    },
  });

  // Hambúrguer Caseiro
  const hamburguer = await prisma.product.create({
    data: {
      name: "Hambúrguer",
      price: 32.0,
      description: "Hambúrguer artesanal de 180g",
      available: true,
      stock: 999, // Estoque padrão
      categoryId: categoryLanches.id,
      canBeUsedInSandwich: true, // Lanches podem ser usados (padrão)
      hasMeatPoint: true, // Hambúrguer tem ponto da carne
      // Conecta os ingredientes
      ingredients: {
        create: [
          { ingredientId: createdIngredients["Pão"] },
          { ingredientId: createdIngredients["Hambúrguer 180g"] },
          { ingredientId: createdIngredients["Queijo"] },
          { ingredientId: createdIngredients["Alface"] },
          { ingredientId: createdIngredients["Cebola"] },
        ],
      },
      // Conecta os adicionais permitidos
      addons: {
        create: [
          { addonId: createdAddons["Ovo"] },
        ],
      },
    },
  });
  console.log("   ✓ Hambúrguer - R$ 32,00");

  // Ká Churrasco
  const ka = await prisma.product.create({
    data: {
      name: "Ká",
      price: 29.0,
      description: "Lanche no pão d'água com espeto à escolha",
      available: true,
      stock: 999, // Estoque padrão
      categoryId: categoryLanches.id,
      canBeUsedInSandwich: true, // Lanches podem ser usados (padrão)
      hasMeatPoint: true, // Ká usa espetinho, tem ponto da carne
      // Conecta os ingredientes
      ingredients: {
        create: [
          { ingredientId: createdIngredients["Pão d'água"] },
          { ingredientId: createdIngredients["Maionese"] },
          { ingredientId: createdIngredients["Queijo"] },
          { ingredientId: createdIngredients["Cebola"] },
          { ingredientId: createdIngredients["Alface"] },
          { ingredientId: createdIngredients["Tomate"] },
        ],
      },
      // Conecta os adicionais permitidos
      addons: {
        create: [
          { addonId: createdAddons["Ovo"] },
        ],
      },
    },
  });
  console.log("   ✓ Ká - R$ 29,00");

  // Xis Churrasco
  const xis = await prisma.product.create({
    data: {
      name: "Xis",
      price: 30.0,
      description: "Lanche no pão de xis prensado com espeto à escolha",
      available: true,
      stock: 999, // Estoque padrão
      categoryId: categoryLanches.id,
      canBeUsedInSandwich: true, // Lanches podem ser usados (padrão)
      hasMeatPoint: true, // Xis usa espetinho, tem ponto da carne
      // Conecta os ingredientes
      ingredients: {
        create: [
          { ingredientId: createdIngredients["Pão de Xis"] },
          { ingredientId: createdIngredients["Maionese"] },
          { ingredientId: createdIngredients["Queijo"] },
          { ingredientId: createdIngredients["Cebola"] },
          { ingredientId: createdIngredients["Alface"] },
          { ingredientId: createdIngredients["Tomate"] },
        ],
      },
      // Conecta os adicionais permitidos
      addons: {
        create: [
          { addonId: createdAddons["Ovo"] },
        ],
      },
    },
  });
  console.log("   ✓ Xis - R$ 30,00");

  // ------------------------------
  // CATEGORIA 4: BEBIDAS (com subcategorias)
  // ------------------------------
  console.log("\n🥤 Criando categoria: Bebidas");

  const categoryBebidas = await prisma.category.create({
    data: {
      categoryName: "Bebidas",
    },
  });

  // Criar subcategorias de bebidas
  console.log("\n   📂 Criando subcategorias de Bebidas...");

  const subcategoryCervejasLitro = await prisma.category.create({
    data: {
      categoryName: "Cervejas Litro",
      parentId: categoryBebidas.id,
    },
  });
  console.log("   ✓ Cervejas Litro");

  const subcategoryCervejas600ml = await prisma.category.create({
    data: {
      categoryName: "Cervejas 600ml",
      parentId: categoryBebidas.id,
    },
  });
  console.log("   ✓ Cervejas 600ml");

  const subcategoryLongneck330ml = await prisma.category.create({
    data: {
      categoryName: "Longneck 330ml",
      parentId: categoryBebidas.id,
    },
  });
  console.log("   ✓ Longneck 330ml");

  const subcategoryChopp = await prisma.category.create({
    data: {
      categoryName: "Chopp",
      parentId: categoryBebidas.id,
    },
  });
  console.log("   ✓ Chopp");

  const subcategoryArtesanais = await prisma.category.create({
    data: {
      categoryName: "Artesanais",
      parentId: categoryBebidas.id,
    },
  });
  console.log("   ✓ Artesanais");

  const subcategoryNaoAlcoolicos = await prisma.category.create({
    data: {
      categoryName: "Não Alcoólicos",
      parentId: categoryBebidas.id,
    },
  });
  console.log("   ✓ Não Alcoólicos");

  const subcategoryVinhos = await prisma.category.create({
    data: {
      categoryName: "Vinhos",
      parentId: categoryBebidas.id,
    },
  });
  console.log("   ✓ Vinhos");


  // Criar produtos nas subcategorias
  console.log("\n   🍺 Criando produtos de Bebidas...");

  // Cervejas Litro
  const cervejasLitro = [
    { name: "Original Litro", price: 20.0 },
    { name: "Budweiser Litro", price: 20.0 },
    { name: "Bohemia Puro Malte Litro", price: 18.0 },
    { name: "Brahma Chopp Litro", price: 18.0 },
    { name: "Polar Litro", price: 18.0 },
    { name: "Amstel Litro", price: 18.0 },
  ];

  for (const bebida of cervejasLitro) {
    await prisma.product.create({
      data: {
        name: bebida.name,
        price: bebida.price,
        description: bebida.name,
        available: true,
        stock: 999,
        categoryId: subcategoryCervejasLitro.id,
        canBeUsedInSandwich: false,
        hasMeatPoint: false,
      },
    });
    console.log(`   ✓ ${bebida.name} - R$ ${bebida.price.toFixed(2)} (Cervejas Litro)`);
  }

  // Cervejas 600ml
  const cervejas600ml = [
    { name: "Heineken 600ml", price: 20.0 },
    { name: "Serramalte 600ml", price: 20.0 },
    { name: "Stella 600ml", price: 18.0 },
    { name: "Original 600ml", price: 18.0 },
    { name: "Spaten 600ml", price: 17.0 },
    { name: "Brahma Duplo Malte 600ml", price: 15.0 },
    { name: "Eisenbahn Pilsen 600ml", price: 16.0 },
    { name: "Brahma Chopp 600ml", price: 14.0 },
    { name: "Polar 600ml", price: 14.0 },
    { name: "Amstel 600ml", price: 14.0 },
  ];

  for (const bebida of cervejas600ml) {
    await prisma.product.create({
      data: {
        name: bebida.name,
        price: bebida.price,
        description: bebida.name,
        available: true,
        stock: 999,
        categoryId: subcategoryCervejas600ml.id,
        canBeUsedInSandwich: false,
        hasMeatPoint: false,
      },
    });
    console.log(`   ✓ ${bebida.name} - R$ ${bebida.price.toFixed(2)} (Cervejas 600ml)`);
  }

  // Longneck 330ml
  const longneck330ml = [
    { name: "Stella Longneck 330ml", price: 12.0 },
    { name: "Budweiser Longneck 330ml", price: 12.0 },
    { name: "Sol Longneck 330ml", price: 12.0 },
    { name: "Heineken Longneck 330ml", price: 12.0 },
    { name: "Heineken Zero Longneck 330ml", price: 12.0 },
    { name: "Corona Longneck 330ml", price: 12.0 },
    { name: "Skol Beats/GT Longneck 330ml", price: 14.0 },
    { name: "Smirnoff Ice Longneck 330ml", price: 16.0 },
  ];

  for (const bebida of longneck330ml) {
    await prisma.product.create({
      data: {
        name: bebida.name,
        price: bebida.price,
        description: bebida.name,
        available: true,
        stock: 999,
        categoryId: subcategoryLongneck330ml.id,
        canBeUsedInSandwich: false,
        hasMeatPoint: false,
      },
    });
    console.log(`   ✓ ${bebida.name} - R$ ${bebida.price.toFixed(2)} (Longneck 330ml)`);
  }

  // Chopp
  const chopp = [
    { name: "Tupiniquim Pilsen", price: 18.0 },
    { name: "Tupiniquim IPA", price: 18.0 },
    { name: "Tupiniquim Helles", price: 18.0 },
    { name: "Tupiniquim Bock", price: 20.0 },
    { name: "Tupiniquim Red Ale", price: 20.0 },
  ];

  for (const bebida of chopp) {
    await prisma.product.create({
      data: {
        name: bebida.name,
        price: bebida.price,
        description: bebida.name,
        available: true,
        stock: 999,
        categoryId: subcategoryChopp.id,
        canBeUsedInSandwich: false,
        hasMeatPoint: false,
      },
    });
    console.log(`   ✓ ${bebida.name} - R$ ${bebida.price.toFixed(2)} (Chopp)`);
  }

  // Artesanais
  const artesanais = [
    { name: "Holz Pilsen", price: 20.0 },
    { name: "Holz IPA", price: 20.0 },
    { name: "Holz APA", price: 20.0 },
    { name: "Colorado Appia 600ml", price: 20.0 },
  ];

  for (const bebida of artesanais) {
    await prisma.product.create({
      data: {
        name: bebida.name,
        price: bebida.price,
        description: bebida.name,
        available: true,
        stock: 999,
        categoryId: subcategoryArtesanais.id,
        canBeUsedInSandwich: false,
        hasMeatPoint: false,
      },
    });
    console.log(`   ✓ ${bebida.name} - R$ ${bebida.price.toFixed(2)} (Artesanais)`);
  }

  // Não Alcoólicos
  const naoAlcoolicos = [
    { name: "Água s/gás 500ml", price: 4.0 },
    { name: "Água c/gás 500ml", price: 4.0 },
    { name: "Suco Petry Laranja 450ml", price: 15.0 },
    { name: "H2O Limão e Limoneto", price: 8.0 },
    { name: "Ice Tea", price: 8.0 },
    { name: "Coca Lata", price: 6.0 },
    { name: "Coca Zero Lata", price: 6.0 },
    { name: "Guaraná Lata", price: 6.0 },
    { name: "Guaraná Zero Lata", price: 6.0 },
    { name: "Fanta Lata", price: 6.0 },
    { name: "Tônica Lata", price: 6.0 },
    { name: "Pepsi Black Lata", price: 6.0 },
    { name: "Coca 600ml", price: 8.0 },
    { name: "Coca Zero 600ml", price: 8.0 },
    { name: "Guaraná 600ml", price: 8.0 },
    { name: "Guaraná Zero 600ml", price: 8.0 },
    { name: "Fanta 600ml", price: 8.0 },
    { name: "Coca Litro Vidro", price: 10.0 },
    { name: "Guaraná Litro Vidro", price: 10.0 },
    { name: "Coca 2 Litros", price: 15.0 },
    { name: "Guaraná 2 Litros", price: 15.0 },
  ];

  for (const bebida of naoAlcoolicos) {
    await prisma.product.create({
      data: {
        name: bebida.name,
        price: bebida.price,
        description: bebida.name,
        available: true,
        stock: 999,
        categoryId: subcategoryNaoAlcoolicos.id,
        canBeUsedInSandwich: false,
        hasMeatPoint: false,
      },
    });
    console.log(`   ✓ ${bebida.name} - R$ ${bebida.price.toFixed(2)} (Não Alcoólicos)`);
  }

  // Vinhos
  const vinhos = [
    { name: "Concha y Toro Cabernet Seco 750ml", price: 50.0 },
    { name: "Concha y Toro Carménère Seco 750ml", price: 50.0 },
    { name: "Concha y Toro Merlot Seco 750ml", price: 50.0 },
    { name: "Concha y Toro Branco Seco 750ml", price: 50.0 },
    { name: "Concha y Toro Seco Taça", price: 16.0 },
  ];

  for (const bebida of vinhos) {
    await prisma.product.create({
      data: {
        name: bebida.name,
        price: bebida.price,
        description: bebida.name,
        available: true,
        stock: 999,
        categoryId: subcategoryVinhos.id,
        canBeUsedInSandwich: false,
        hasMeatPoint: false,
      },
    });
    console.log(`   ✓ ${bebida.name} - R$ ${bebida.price.toFixed(2)} (Vinhos)`);
  }

  // ============================================
  // 8. RESUMO FINAL
  // ============================================
  console.log("\n" + "=".repeat(50));
  console.log("✅ SEED CONCLUÍDO COM SUCESSO!");
  console.log("=".repeat(50));

  const totalCategories = await prisma.category.count();
  const totalProducts = await prisma.product.count();
  const totalUsers = await prisma.user.count();
  const totalIngredients = await prisma.ingredient.count();
  const totalAddons = await prisma.addon.count();
  const totalRoles = await prisma.role.count();
  const totalPermissions = await prisma.permission.count();

  console.log(`\n📊 Resumo:`);
  console.log(`   • ${totalUsers} usuário(s)`);
  console.log(`   • ${totalRoles} cargo(s)`);
  console.log(`   • ${totalPermissions} permissão(ões)`);
  console.log(`   • ${totalCategories} categoria(s)`);
  console.log(`   • ${totalProducts} produto(s)`);
  console.log(`   • ${totalIngredients} ingrediente(s)`);
  console.log(`   • ${totalAddons} adicional(is)`);

  console.log(`\n🔐 Credenciais de acesso:`);
  console.log(`   Login: ${ADMIN_LOGIN}`);
  console.log(`   Senha: ${ADMIN_PASSWORD === "123" ? "123 (ALTERE EM PRODUÇÃO!)" : "***"}`);

  console.log(`\n🎉 O sistema está pronto para uso!\n`);
}

// Executar o seed
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("\n❌ Erro ao executar seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
