# Minim um 5 campuri cu tipuri diferite (String, Number, Boolean, Date)
<<<<<<< HEAD
<<<<<<< HEAD
### 1. Existente in [schema.prisma](prisma/schema.prisma)
### 2. Implicit, fiecare camp in prisma care nu are "?" este required
### 3. default pentru id
### 4. In [schema.prisma](prisma/schema.prisma) se poate afla linia `/// @zod.custom.use(z.number().int().gte(0).lte(1e+7))`, e validator la application layer nu db layer.

# Schema pentru utilizatori
### 1. Adaugat campul de "role" [schema.prisma:23](prisma/schema.prisma)
### 2. Index unic pe "emai" [schema.prisma:22](prisma/schema.prisma)
### 3. Pre-save hook [prisma.ts:8](src/client/prisma.ts)
=======
### 1. Existente in [schema.prisma](server/prisma/schema.prisma)
=======
### 1. Existente in [schema.prisma](prisma/schema.prisma)
>>>>>>> 604e7b2 (Modificat path-urile din readme din server lab7 sa functioneze)
### 2. Implicit, fiecare camp in prisma care nu are "?" este required
### 3. default pentru id
### 4. In [schema.prisma](prisma/schema.prisma) se poate afla linia `/// @zod.custom.use(z.number().int().gte(0).lte(1e+7))`, e validator la application layer nu db layer.

# Schema pentru utilizatori
<<<<<<< HEAD
### 1. Adaugat campul de "role" [schema.prisma:23](server/prisma/schema.prisma)
### 2. Index unic pe "emai" [schema.prisma:22](server/prisma/schema.prisma)
### 3. Pre-save hook [prisma.ts:8](server/prisma/schema.prisma)
>>>>>>> 9e1cb28 (Schimbat numele in README.md pentru tema7 din server)
=======
### 1. Adaugat campul de "role" [schema.prisma:23](prisma/schema.prisma)
### 2. Index unic pe "emai" [schema.prisma:22](prisma/schema.prisma)
### 3. Pre-save hook [prisma.ts:8](prisma/schema.prisma)
>>>>>>> 604e7b2 (Modificat path-urile din readme din server lab7 sa functioneze)
