-- CreateTable
CREATE TABLE "register_requests" (
    "request_id" SERIAL NOT NULL,
    "otp_code" TEXT,
    "created_at" DATE,
    "phone_number" BIGINT,
    "finished" BOOLEAN DEFAULT false,

    CONSTRAINT "register_requests_pkey" PRIMARY KEY ("request_id")
);

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

    CONSTRAINT "clients_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "client_email" (
    "email_id" SERIAL NOT NULL,
    "email_address" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "role_id" SMALLINT NOT NULL,
    "client_id" SMALLINT NOT NULL,

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