-- CreateTable
CREATE TABLE "client_roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(20),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "contact_roles" (
    "role_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "phone_roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "client" (
    "personal_data" JSONB,
    "professional_data" JSONB,
    "address" JSONB,
    "client_id" SERIAL NOT NULL,
    "role_id" SMALLINT NOT NULL,
    "bi_number" TEXT,
    "membership_number" TEXT,
    "access_code" TEXT,
    "authentication_otp" TEXT,
    "first_login" BOOLEAN,
    "token" TEXT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "client_email" (
    "email_id" SERIAL NOT NULL,
    "email_address" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "role_id" SMALLINT NOT NULL,
    "client_id" SMALLINT,
    "token" TEXT,
    "complete" BOOLEAN,

    CONSTRAINT "user_email_pkey" PRIMARY KEY ("email_id")
);

-- CreateTable
CREATE TABLE "client_phones" (
    "id_phone" SERIAL NOT NULL,
    "phone_number" BIGINT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "role_id" SMALLINT NOT NULL DEFAULT 1,
    "client_id" SMALLINT NOT NULL,

    CONSTRAINT "client_phone_pkey" PRIMARY KEY ("id_phone")
);

-- CreateTable
CREATE TABLE "client_images" (
    "id_client_image" SERIAL NOT NULL,
    "path" TEXT,
    "client_id" SMALLINT,
    "image_role" SMALLINT,

    CONSTRAINT "users_images_pkey" PRIMARY KEY ("id_client_image")
);

-- CreateTable
CREATE TABLE "image_roles" (
    "role_id" SERIAL NOT NULL,
    "name" TEXT,

    CONSTRAINT "image_roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "account" (
    "account_id" SERIAL NOT NULL,
    "client_id" SMALLINT,
    "account_iban" TEXT,
    "created_at" TEXT,
    "account_number" TEXT,
    "account_nbi" TEXT,
    "bic" TEXT,
    "account_role" SMALLINT,
    "available_balance" DOUBLE PRECISION,
    "authorized_balance" DOUBLE PRECISION,
    "state" TEXT,
    "currency" TEXT,
    "up_balance" DOUBLE PRECISION,
    "local" TEXT,
    "area" TEXT,

    CONSTRAINT "account_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "card" (
    "card_id" SERIAL NOT NULL,
    "number" BIGINT,
    "role_id" SMALLINT,
    "account_id" SMALLINT,
    "created_at" TEXT,
    "pin" TEXT,
    "nickname" TEXT,
    "state" TEXT,

    CONSTRAINT "card_pkey" PRIMARY KEY ("card_id")
);

-- CreateTable
CREATE TABLE "card_roles" (
    "role_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "card_roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "transfer_type" (
    "type_id" SERIAL NOT NULL,
    "name" TEXT,

    CONSTRAINT "transfer_type_pkey" PRIMARY KEY ("type_id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" SERIAL NOT NULL,
    "balance" DECIMAL,
    "accountFrom" TEXT,
    "accountTo" TEXT,
    "transfer_description" TEXT,
    "receptor_description" TEXT,
    "date" TEXT,
    "status" TEXT,
    "type" SERIAL NOT NULL,
    "emissor_description" TEXT,

    CONSTRAINT "transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friends" (
    "id" SERIAL NOT NULL,
    "client_id" SMALLINT,
    "friend_id" SMALLINT,
    "nickname" TEXT,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "money_requests" (
    "id" SERIAL NOT NULL,
    "emailFrom" TEXT,
    "emailTo" TEXT,
    "balance" DOUBLE PRECISION,
    "date" TEXT,
    "status" SMALLINT,

    CONSTRAINT "money_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_status" (
    "id" SERIAL NOT NULL,
    "name" TEXT,

    CONSTRAINT "request_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "tittle" TEXT,
    "email" TEXT,
    "type" SMALLINT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT,

    CONSTRAINT "notifications_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_roles" (
    "role_id" SERIAL NOT NULL,
    "name" TEXT,

    CONSTRAINT "account_roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "entity" (
    "entity_id" SERIAL NOT NULL,
    "reference" TEXT,
    "name" TEXT,
    "balance" TEXT,
    "account_id" SMALLINT,
    "description" TEXT,
    "products" JSONB,
    "logo" TEXT,

    CONSTRAINT "entitys_pkey" PRIMARY KEY ("entity_id")
);

-- CreateTable
CREATE TABLE "upmoney" (
    "id" SERIAL NOT NULL,
    "number" BIGINT,
    "pin" TEXT,
    "date" TEXT,
    "balance" DOUBLE PRECISION,
    "accountFrom" TEXT,
    "accountTo" TEXT,
    "status" SMALLINT,
    "transferId" SMALLINT,

    CONSTRAINT "upmoney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pay_references" (
    "id" SERIAL NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "balance" DOUBLE PRECISION,
    "date" TEXT,
    "state" SMALLINT,
    "entity" TEXT,
    "emissor_description" TEXT,
    "payer_description" TEXT,
    "payer_nbi" TEXT,

    CONSTRAINT "pay_references_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "fk_role" FOREIGN KEY ("role_id") REFERENCES "client_roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client_email" ADD CONSTRAINT "fk_role_id" FOREIGN KEY ("role_id") REFERENCES "contact_roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client_email" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("client_id") REFERENCES "client"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client_phones" ADD CONSTRAINT "fk_role" FOREIGN KEY ("role_id") REFERENCES "contact_roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client_phones" ADD CONSTRAINT "fk_user_mid" FOREIGN KEY ("client_id") REFERENCES "client"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client_images" ADD CONSTRAINT "client_id_fk" FOREIGN KEY ("client_id") REFERENCES "client"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client_images" ADD CONSTRAINT "fk_image_role" FOREIGN KEY ("image_role") REFERENCES "image_roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "fk_client_id" FOREIGN KEY ("client_id") REFERENCES "client"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "fk_account_id" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "fk_role_id" FOREIGN KEY ("role_id") REFERENCES "card_roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "type_fk" FOREIGN KEY ("type") REFERENCES "transfer_type"("type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "fk_client_id" FOREIGN KEY ("client_id") REFERENCES "client"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "fk_type" FOREIGN KEY ("type") REFERENCES "notifications_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entity" ADD CONSTRAINT "fk_account_id" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "upmoney" ADD CONSTRAINT "fk_status" FOREIGN KEY ("status") REFERENCES "request_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "upmoney" ADD CONSTRAINT "fk_tranferId" FOREIGN KEY ("transferId") REFERENCES "transfers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
