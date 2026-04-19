import { z } from 'zod';
import type { Prisma } from '../prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','name','email','password_hash','uuid']);

export const DesktopIconScalarFieldEnumSchema = z.enum(['id','filename','file_type','bytes','cell','userId']);

export const SortOrderSchema = z.enum(['asc','desc']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  password_hash: z.string(),
  uuid: z.string(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// DESKTOP ICON SCHEMA
/////////////////////////////////////////

export const DesktopIconSchema = z.object({
  id: z.uuid(),
  filename: z.string(),
  file_type: z.string(),
  bytes: z.number().int(),
  cell: z.number().int(),
  userId: z.number().int(),
})

export type DesktopIcon = z.infer<typeof DesktopIconSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  icons: z.union([z.boolean(),z.lazy(() => DesktopIconFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  icons: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  email: z.boolean().optional(),
  password_hash: z.boolean().optional(),
  uuid: z.boolean().optional(),
  icons: z.union([z.boolean(),z.lazy(() => DesktopIconFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// DESKTOP ICON
//------------------------------------------------------

export const DesktopIconIncludeSchema: z.ZodType<Prisma.DesktopIconInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const DesktopIconArgsSchema: z.ZodType<Prisma.DesktopIconDefaultArgs> = z.object({
  select: z.lazy(() => DesktopIconSelectSchema).optional(),
  include: z.lazy(() => DesktopIconIncludeSchema).optional(),
}).strict();

export const DesktopIconSelectSchema: z.ZodType<Prisma.DesktopIconSelect> = z.object({
  id: z.boolean().optional(),
  filename: z.boolean().optional(),
  file_type: z.boolean().optional(),
  bytes: z.boolean().optional(),
  cell: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  password_hash: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  uuid: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  icons: z.lazy(() => DesktopIconListRelationFilterSchema).optional(),
});

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password_hash: z.lazy(() => SortOrderSchema).optional(),
  uuid: z.lazy(() => SortOrderSchema).optional(),
  icons: z.lazy(() => DesktopIconOrderByRelationAggregateInputSchema).optional(),
});

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    email: z.string(),
    uuid: z.string(),
  }),
  z.object({
    id: z.number().int(),
    email: z.string(),
  }),
  z.object({
    id: z.number().int(),
    uuid: z.string(),
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    email: z.string(),
    uuid: z.string(),
  }),
  z.object({
    email: z.string(),
  }),
  z.object({
    uuid: z.string(),
  }),
])
.and(z.strictObject({
  id: z.number().int().optional(),
  email: z.string().optional(),
  uuid: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  password_hash: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  icons: z.lazy(() => DesktopIconListRelationFilterSchema).optional(),
}));

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password_hash: z.lazy(() => SortOrderSchema).optional(),
  uuid: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserSumOrderByAggregateInputSchema).optional(),
});

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  password_hash: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  uuid: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
});

export const DesktopIconWhereInputSchema: z.ZodType<Prisma.DesktopIconWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => DesktopIconWhereInputSchema), z.lazy(() => DesktopIconWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DesktopIconWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DesktopIconWhereInputSchema), z.lazy(() => DesktopIconWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  filename: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  file_type: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  bytes: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  cell: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  userId: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
});

export const DesktopIconOrderByWithRelationInputSchema: z.ZodType<Prisma.DesktopIconOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  filename: z.lazy(() => SortOrderSchema).optional(),
  file_type: z.lazy(() => SortOrderSchema).optional(),
  bytes: z.lazy(() => SortOrderSchema).optional(),
  cell: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
});

export const DesktopIconWhereUniqueInputSchema: z.ZodType<Prisma.DesktopIconWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    userId_filename: z.lazy(() => DesktopIconUserIdFilenameCompoundUniqueInputSchema),
    userId_cell: z.lazy(() => DesktopIconUserIdCellCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    userId_filename: z.lazy(() => DesktopIconUserIdFilenameCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    userId_cell: z.lazy(() => DesktopIconUserIdCellCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    userId_filename: z.lazy(() => DesktopIconUserIdFilenameCompoundUniqueInputSchema),
    userId_cell: z.lazy(() => DesktopIconUserIdCellCompoundUniqueInputSchema),
  }),
  z.object({
    userId_filename: z.lazy(() => DesktopIconUserIdFilenameCompoundUniqueInputSchema),
  }),
  z.object({
    userId_cell: z.lazy(() => DesktopIconUserIdCellCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  userId_filename: z.lazy(() => DesktopIconUserIdFilenameCompoundUniqueInputSchema).optional(),
  userId_cell: z.lazy(() => DesktopIconUserIdCellCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => DesktopIconWhereInputSchema), z.lazy(() => DesktopIconWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DesktopIconWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DesktopIconWhereInputSchema), z.lazy(() => DesktopIconWhereInputSchema).array() ]).optional(),
  filename: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  file_type: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  bytes: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  cell: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  userId: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
}));

export const DesktopIconOrderByWithAggregationInputSchema: z.ZodType<Prisma.DesktopIconOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  filename: z.lazy(() => SortOrderSchema).optional(),
  file_type: z.lazy(() => SortOrderSchema).optional(),
  bytes: z.lazy(() => SortOrderSchema).optional(),
  cell: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => DesktopIconCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => DesktopIconAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => DesktopIconMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => DesktopIconMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => DesktopIconSumOrderByAggregateInputSchema).optional(),
});

export const DesktopIconScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.DesktopIconScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => DesktopIconScalarWhereWithAggregatesInputSchema), z.lazy(() => DesktopIconScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => DesktopIconScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DesktopIconScalarWhereWithAggregatesInputSchema), z.lazy(() => DesktopIconScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  filename: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  file_type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  bytes: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  cell: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  userId: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
});

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.strictObject({
  name: z.string(),
  email: z.string(),
  password_hash: z.string(),
  uuid: z.string(),
  icons: z.lazy(() => DesktopIconCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  email: z.string(),
  password_hash: z.string(),
  uuid: z.string(),
  icons: z.lazy(() => DesktopIconUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password_hash: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  uuid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  icons: z.lazy(() => DesktopIconUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password_hash: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  uuid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  icons: z.lazy(() => DesktopIconUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  email: z.string(),
  password_hash: z.string(),
  uuid: z.string(),
});

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password_hash: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  uuid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password_hash: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  uuid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const DesktopIconCreateInputSchema: z.ZodType<Prisma.DesktopIconCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  filename: z.string(),
  file_type: z.string(),
  bytes: z.number().int(),
  cell: z.number().int(),
  user: z.lazy(() => UserCreateNestedOneWithoutIconsInputSchema),
});

export const DesktopIconUncheckedCreateInputSchema: z.ZodType<Prisma.DesktopIconUncheckedCreateInput> = z.strictObject({
  id: z.uuid().optional(),
  filename: z.string(),
  file_type: z.string(),
  bytes: z.number().int(),
  cell: z.number().int(),
  userId: z.number().int(),
});

export const DesktopIconUpdateInputSchema: z.ZodType<Prisma.DesktopIconUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filename: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  file_type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  bytes: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  cell: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutIconsNestedInputSchema).optional(),
});

export const DesktopIconUncheckedUpdateInputSchema: z.ZodType<Prisma.DesktopIconUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filename: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  file_type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  bytes: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  cell: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const DesktopIconCreateManyInputSchema: z.ZodType<Prisma.DesktopIconCreateManyInput> = z.strictObject({
  id: z.uuid().optional(),
  filename: z.string(),
  file_type: z.string(),
  bytes: z.number().int(),
  cell: z.number().int(),
  userId: z.number().int(),
});

export const DesktopIconUpdateManyMutationInputSchema: z.ZodType<Prisma.DesktopIconUpdateManyMutationInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filename: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  file_type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  bytes: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  cell: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const DesktopIconUncheckedUpdateManyInputSchema: z.ZodType<Prisma.DesktopIconUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filename: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  file_type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  bytes: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  cell: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
});

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
});

export const DesktopIconListRelationFilterSchema: z.ZodType<Prisma.DesktopIconListRelationFilter> = z.strictObject({
  every: z.lazy(() => DesktopIconWhereInputSchema).optional(),
  some: z.lazy(() => DesktopIconWhereInputSchema).optional(),
  none: z.lazy(() => DesktopIconWhereInputSchema).optional(),
});

export const DesktopIconOrderByRelationAggregateInputSchema: z.ZodType<Prisma.DesktopIconOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password_hash: z.lazy(() => SortOrderSchema).optional(),
  uuid: z.lazy(() => SortOrderSchema).optional(),
});

export const UserAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password_hash: z.lazy(() => SortOrderSchema).optional(),
  uuid: z.lazy(() => SortOrderSchema).optional(),
});

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password_hash: z.lazy(() => SortOrderSchema).optional(),
  uuid: z.lazy(() => SortOrderSchema).optional(),
});

export const UserSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
});

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const UserScalarRelationFilterSchema: z.ZodType<Prisma.UserScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional(),
});

export const DesktopIconUserIdFilenameCompoundUniqueInputSchema: z.ZodType<Prisma.DesktopIconUserIdFilenameCompoundUniqueInput> = z.strictObject({
  userId: z.number(),
  filename: z.string(),
});

export const DesktopIconUserIdCellCompoundUniqueInputSchema: z.ZodType<Prisma.DesktopIconUserIdCellCompoundUniqueInput> = z.strictObject({
  userId: z.number(),
  cell: z.number(),
});

export const DesktopIconCountOrderByAggregateInputSchema: z.ZodType<Prisma.DesktopIconCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  filename: z.lazy(() => SortOrderSchema).optional(),
  file_type: z.lazy(() => SortOrderSchema).optional(),
  bytes: z.lazy(() => SortOrderSchema).optional(),
  cell: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
});

export const DesktopIconAvgOrderByAggregateInputSchema: z.ZodType<Prisma.DesktopIconAvgOrderByAggregateInput> = z.strictObject({
  bytes: z.lazy(() => SortOrderSchema).optional(),
  cell: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
});

export const DesktopIconMaxOrderByAggregateInputSchema: z.ZodType<Prisma.DesktopIconMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  filename: z.lazy(() => SortOrderSchema).optional(),
  file_type: z.lazy(() => SortOrderSchema).optional(),
  bytes: z.lazy(() => SortOrderSchema).optional(),
  cell: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
});

export const DesktopIconMinOrderByAggregateInputSchema: z.ZodType<Prisma.DesktopIconMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  filename: z.lazy(() => SortOrderSchema).optional(),
  file_type: z.lazy(() => SortOrderSchema).optional(),
  bytes: z.lazy(() => SortOrderSchema).optional(),
  cell: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
});

export const DesktopIconSumOrderByAggregateInputSchema: z.ZodType<Prisma.DesktopIconSumOrderByAggregateInput> = z.strictObject({
  bytes: z.lazy(() => SortOrderSchema).optional(),
  cell: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
});

export const DesktopIconCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.DesktopIconCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => DesktopIconCreateWithoutUserInputSchema), z.lazy(() => DesktopIconCreateWithoutUserInputSchema).array(), z.lazy(() => DesktopIconUncheckedCreateWithoutUserInputSchema), z.lazy(() => DesktopIconUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => DesktopIconCreateOrConnectWithoutUserInputSchema), z.lazy(() => DesktopIconCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => DesktopIconCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => DesktopIconWhereUniqueInputSchema), z.lazy(() => DesktopIconWhereUniqueInputSchema).array() ]).optional(),
});

export const DesktopIconUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.DesktopIconUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => DesktopIconCreateWithoutUserInputSchema), z.lazy(() => DesktopIconCreateWithoutUserInputSchema).array(), z.lazy(() => DesktopIconUncheckedCreateWithoutUserInputSchema), z.lazy(() => DesktopIconUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => DesktopIconCreateOrConnectWithoutUserInputSchema), z.lazy(() => DesktopIconCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => DesktopIconCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => DesktopIconWhereUniqueInputSchema), z.lazy(() => DesktopIconWhereUniqueInputSchema).array() ]).optional(),
});

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.strictObject({
  set: z.string().optional(),
});

export const DesktopIconUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.DesktopIconUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => DesktopIconCreateWithoutUserInputSchema), z.lazy(() => DesktopIconCreateWithoutUserInputSchema).array(), z.lazy(() => DesktopIconUncheckedCreateWithoutUserInputSchema), z.lazy(() => DesktopIconUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => DesktopIconCreateOrConnectWithoutUserInputSchema), z.lazy(() => DesktopIconCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => DesktopIconUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => DesktopIconUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => DesktopIconCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => DesktopIconWhereUniqueInputSchema), z.lazy(() => DesktopIconWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => DesktopIconWhereUniqueInputSchema), z.lazy(() => DesktopIconWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => DesktopIconWhereUniqueInputSchema), z.lazy(() => DesktopIconWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => DesktopIconWhereUniqueInputSchema), z.lazy(() => DesktopIconWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => DesktopIconUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => DesktopIconUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => DesktopIconUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => DesktopIconUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => DesktopIconScalarWhereInputSchema), z.lazy(() => DesktopIconScalarWhereInputSchema).array() ]).optional(),
});

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.strictObject({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
});

export const DesktopIconUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.DesktopIconUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => DesktopIconCreateWithoutUserInputSchema), z.lazy(() => DesktopIconCreateWithoutUserInputSchema).array(), z.lazy(() => DesktopIconUncheckedCreateWithoutUserInputSchema), z.lazy(() => DesktopIconUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => DesktopIconCreateOrConnectWithoutUserInputSchema), z.lazy(() => DesktopIconCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => DesktopIconUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => DesktopIconUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => DesktopIconCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => DesktopIconWhereUniqueInputSchema), z.lazy(() => DesktopIconWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => DesktopIconWhereUniqueInputSchema), z.lazy(() => DesktopIconWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => DesktopIconWhereUniqueInputSchema), z.lazy(() => DesktopIconWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => DesktopIconWhereUniqueInputSchema), z.lazy(() => DesktopIconWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => DesktopIconUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => DesktopIconUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => DesktopIconUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => DesktopIconUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => DesktopIconScalarWhereInputSchema), z.lazy(() => DesktopIconScalarWhereInputSchema).array() ]).optional(),
});

export const UserCreateNestedOneWithoutIconsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutIconsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutIconsInputSchema), z.lazy(() => UserUncheckedCreateWithoutIconsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutIconsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export const UserUpdateOneRequiredWithoutIconsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutIconsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutIconsInputSchema), z.lazy(() => UserUncheckedCreateWithoutIconsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutIconsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutIconsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutIconsInputSchema), z.lazy(() => UserUpdateWithoutIconsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutIconsInputSchema) ]).optional(),
});

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
});

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
});

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
});

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
});

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const DesktopIconCreateWithoutUserInputSchema: z.ZodType<Prisma.DesktopIconCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  filename: z.string(),
  file_type: z.string(),
  bytes: z.number().int(),
  cell: z.number().int(),
});

export const DesktopIconUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.DesktopIconUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.uuid().optional(),
  filename: z.string(),
  file_type: z.string(),
  bytes: z.number().int(),
  cell: z.number().int(),
});

export const DesktopIconCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.DesktopIconCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => DesktopIconWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => DesktopIconCreateWithoutUserInputSchema), z.lazy(() => DesktopIconUncheckedCreateWithoutUserInputSchema) ]),
});

export const DesktopIconCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.DesktopIconCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => DesktopIconCreateManyUserInputSchema), z.lazy(() => DesktopIconCreateManyUserInputSchema).array() ]),
});

export const DesktopIconUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.DesktopIconUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => DesktopIconWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => DesktopIconUpdateWithoutUserInputSchema), z.lazy(() => DesktopIconUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => DesktopIconCreateWithoutUserInputSchema), z.lazy(() => DesktopIconUncheckedCreateWithoutUserInputSchema) ]),
});

export const DesktopIconUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.DesktopIconUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => DesktopIconWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => DesktopIconUpdateWithoutUserInputSchema), z.lazy(() => DesktopIconUncheckedUpdateWithoutUserInputSchema) ]),
});

export const DesktopIconUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.DesktopIconUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => DesktopIconScalarWhereInputSchema),
  data: z.union([ z.lazy(() => DesktopIconUpdateManyMutationInputSchema), z.lazy(() => DesktopIconUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const DesktopIconScalarWhereInputSchema: z.ZodType<Prisma.DesktopIconScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => DesktopIconScalarWhereInputSchema), z.lazy(() => DesktopIconScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DesktopIconScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DesktopIconScalarWhereInputSchema), z.lazy(() => DesktopIconScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  filename: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  file_type: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  bytes: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  cell: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  userId: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
});

export const UserCreateWithoutIconsInputSchema: z.ZodType<Prisma.UserCreateWithoutIconsInput> = z.strictObject({
  name: z.string(),
  email: z.string(),
  password_hash: z.string(),
  uuid: z.string(),
});

export const UserUncheckedCreateWithoutIconsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutIconsInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  email: z.string(),
  password_hash: z.string(),
  uuid: z.string(),
});

export const UserCreateOrConnectWithoutIconsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutIconsInput> = z.strictObject({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutIconsInputSchema), z.lazy(() => UserUncheckedCreateWithoutIconsInputSchema) ]),
});

export const UserUpsertWithoutIconsInputSchema: z.ZodType<Prisma.UserUpsertWithoutIconsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutIconsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutIconsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutIconsInputSchema), z.lazy(() => UserUncheckedCreateWithoutIconsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export const UserUpdateToOneWithWhereWithoutIconsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutIconsInput> = z.strictObject({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutIconsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutIconsInputSchema) ]),
});

export const UserUpdateWithoutIconsInputSchema: z.ZodType<Prisma.UserUpdateWithoutIconsInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password_hash: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  uuid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const UserUncheckedUpdateWithoutIconsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutIconsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password_hash: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  uuid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const DesktopIconCreateManyUserInputSchema: z.ZodType<Prisma.DesktopIconCreateManyUserInput> = z.strictObject({
  id: z.uuid().optional(),
  filename: z.string(),
  file_type: z.string(),
  bytes: z.number().int(),
  cell: z.number().int(),
});

export const DesktopIconUpdateWithoutUserInputSchema: z.ZodType<Prisma.DesktopIconUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filename: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  file_type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  bytes: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  cell: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const DesktopIconUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.DesktopIconUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filename: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  file_type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  bytes: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  cell: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const DesktopIconUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.DesktopIconUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  filename: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  file_type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  bytes: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  cell: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(), UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(), 
  having: UserScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const DesktopIconFindFirstArgsSchema: z.ZodType<Prisma.DesktopIconFindFirstArgs> = z.object({
  select: DesktopIconSelectSchema.optional(),
  include: DesktopIconIncludeSchema.optional(),
  where: DesktopIconWhereInputSchema.optional(), 
  orderBy: z.union([ DesktopIconOrderByWithRelationInputSchema.array(), DesktopIconOrderByWithRelationInputSchema ]).optional(),
  cursor: DesktopIconWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DesktopIconScalarFieldEnumSchema, DesktopIconScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const DesktopIconFindFirstOrThrowArgsSchema: z.ZodType<Prisma.DesktopIconFindFirstOrThrowArgs> = z.object({
  select: DesktopIconSelectSchema.optional(),
  include: DesktopIconIncludeSchema.optional(),
  where: DesktopIconWhereInputSchema.optional(), 
  orderBy: z.union([ DesktopIconOrderByWithRelationInputSchema.array(), DesktopIconOrderByWithRelationInputSchema ]).optional(),
  cursor: DesktopIconWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DesktopIconScalarFieldEnumSchema, DesktopIconScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const DesktopIconFindManyArgsSchema: z.ZodType<Prisma.DesktopIconFindManyArgs> = z.object({
  select: DesktopIconSelectSchema.optional(),
  include: DesktopIconIncludeSchema.optional(),
  where: DesktopIconWhereInputSchema.optional(), 
  orderBy: z.union([ DesktopIconOrderByWithRelationInputSchema.array(), DesktopIconOrderByWithRelationInputSchema ]).optional(),
  cursor: DesktopIconWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DesktopIconScalarFieldEnumSchema, DesktopIconScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const DesktopIconAggregateArgsSchema: z.ZodType<Prisma.DesktopIconAggregateArgs> = z.object({
  where: DesktopIconWhereInputSchema.optional(), 
  orderBy: z.union([ DesktopIconOrderByWithRelationInputSchema.array(), DesktopIconOrderByWithRelationInputSchema ]).optional(),
  cursor: DesktopIconWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const DesktopIconGroupByArgsSchema: z.ZodType<Prisma.DesktopIconGroupByArgs> = z.object({
  where: DesktopIconWhereInputSchema.optional(), 
  orderBy: z.union([ DesktopIconOrderByWithAggregationInputSchema.array(), DesktopIconOrderByWithAggregationInputSchema ]).optional(),
  by: DesktopIconScalarFieldEnumSchema.array(), 
  having: DesktopIconScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const DesktopIconFindUniqueArgsSchema: z.ZodType<Prisma.DesktopIconFindUniqueArgs> = z.object({
  select: DesktopIconSelectSchema.optional(),
  include: DesktopIconIncludeSchema.optional(),
  where: DesktopIconWhereUniqueInputSchema, 
}).strict();

export const DesktopIconFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.DesktopIconFindUniqueOrThrowArgs> = z.object({
  select: DesktopIconSelectSchema.optional(),
  include: DesktopIconIncludeSchema.optional(),
  where: DesktopIconWhereUniqueInputSchema, 
}).strict();

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema, UserUncheckedCreateInputSchema ]),
}).strict();

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
  create: z.union([ UserCreateInputSchema, UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema, UserUncheckedUpdateInputSchema ]),
}).strict();

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema, UserCreateManyInputSchema.array() ]),
}).strict();

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema, UserCreateManyInputSchema.array() ]),
}).strict();

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema, UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserUpdateManyAndReturnArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const DesktopIconCreateArgsSchema: z.ZodType<Prisma.DesktopIconCreateArgs> = z.object({
  select: DesktopIconSelectSchema.optional(),
  include: DesktopIconIncludeSchema.optional(),
  data: z.union([ DesktopIconCreateInputSchema, DesktopIconUncheckedCreateInputSchema ]),
}).strict();

export const DesktopIconUpsertArgsSchema: z.ZodType<Prisma.DesktopIconUpsertArgs> = z.object({
  select: DesktopIconSelectSchema.optional(),
  include: DesktopIconIncludeSchema.optional(),
  where: DesktopIconWhereUniqueInputSchema, 
  create: z.union([ DesktopIconCreateInputSchema, DesktopIconUncheckedCreateInputSchema ]),
  update: z.union([ DesktopIconUpdateInputSchema, DesktopIconUncheckedUpdateInputSchema ]),
}).strict();

export const DesktopIconCreateManyArgsSchema: z.ZodType<Prisma.DesktopIconCreateManyArgs> = z.object({
  data: z.union([ DesktopIconCreateManyInputSchema, DesktopIconCreateManyInputSchema.array() ]),
}).strict();

export const DesktopIconCreateManyAndReturnArgsSchema: z.ZodType<Prisma.DesktopIconCreateManyAndReturnArgs> = z.object({
  data: z.union([ DesktopIconCreateManyInputSchema, DesktopIconCreateManyInputSchema.array() ]),
}).strict();

export const DesktopIconDeleteArgsSchema: z.ZodType<Prisma.DesktopIconDeleteArgs> = z.object({
  select: DesktopIconSelectSchema.optional(),
  include: DesktopIconIncludeSchema.optional(),
  where: DesktopIconWhereUniqueInputSchema, 
}).strict();

export const DesktopIconUpdateArgsSchema: z.ZodType<Prisma.DesktopIconUpdateArgs> = z.object({
  select: DesktopIconSelectSchema.optional(),
  include: DesktopIconIncludeSchema.optional(),
  data: z.union([ DesktopIconUpdateInputSchema, DesktopIconUncheckedUpdateInputSchema ]),
  where: DesktopIconWhereUniqueInputSchema, 
}).strict();

export const DesktopIconUpdateManyArgsSchema: z.ZodType<Prisma.DesktopIconUpdateManyArgs> = z.object({
  data: z.union([ DesktopIconUpdateManyMutationInputSchema, DesktopIconUncheckedUpdateManyInputSchema ]),
  where: DesktopIconWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const DesktopIconUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.DesktopIconUpdateManyAndReturnArgs> = z.object({
  data: z.union([ DesktopIconUpdateManyMutationInputSchema, DesktopIconUncheckedUpdateManyInputSchema ]),
  where: DesktopIconWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const DesktopIconDeleteManyArgsSchema: z.ZodType<Prisma.DesktopIconDeleteManyArgs> = z.object({
  where: DesktopIconWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();