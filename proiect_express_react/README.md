# Pentru laboratorul 7

### 1. Inregistrare / Autentificare
In [dbOld](server/src/db/authOld.ts) este versiunea veche, manuala, incat in [db](server/src/db/auth.ts) se afla autentificarea cu ORM-ul prisma. Versiunea veche foloseste
```ts
type StoredAccount = {
    email: string;
    hashedPassword: string;
    uuid: string;
};

let AccountRegistry: Record<string, StoredAccount> = {};
```
pentru a mentine inregistrarile in memory.

### 2. Sesiune
Pentru sesiune se foloseste middleware-ul `expressjwt` pentru a verifica automat daca token-ul a expirat si etc...

### 3. Zona protejata
Dupa pagina de login, pagina de root (/desktop) contine desktop-ul in sine al utilizatorului, care poate fi accesat doar dupa logare

### 4. Middleware propriu
In [VisitCouter](server/src/middleware/VisitCounter.ts) am creat un middleware propriu care mentine numarul de visitari bazat pe numarul de GET-uri la `app.get('/api/desktop', VisitCounter, requireLogin, async (req: Request, res: Response) => {` (chiar daca acest endpoint va fi accesat de mai multe ori, cum ar fi in caz ca cache-ul din frontend care utilzeaza tanstack devine invalid / stale)

### Alte specificati
Incat proiectul foloseste react, frontend si backend sunt separate in `/client` si `/server` asa ca nu folosesc un endpoint pentru a returna formularele, formularele respective se afla:
1. Pentru `GET /register`: [Register.tsx](client/src/views/Register.tsx)
2. Pentru `GET /login`: [Login.tsx](client/src/views/Login.tsx)
3. Pentru `GET /<zona-voastra>`: [Desktop.tsx](client/src/views/Desktop.tsx)

Nu am timp la acest laborator, dar `logout` inca nu exista pentru ca tin jwt in localstorage pentru ca am testat acolo initial si acolo a ramas temporar (stiu ca e o problema de securitate)

### 2.3
La subpunct 1: sa spunem ca utilizatorul vrea sa fie anonim! asa ca numele personalizat e doar o parte din uuid!





