-- Create states table
CREATE TABLE IF NOT EXISTS public.states (
    id SERIAL PRIMARY KEY,
    state_name VARCHAR(255) NOT NULL UNIQUE
);

-- Create user table (quoted because "user" is a reserved keyword)
CREATE TABLE IF NOT EXISTS public."user" (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    college VARCHAR(255) NOT NULL,
    state_id INTEGER REFERENCES public.states(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_verification_otps table
CREATE TABLE IF NOT EXISTS public.user_verification_otps (
    otp_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public."user"(id) ON DELETE CASCADE,
    otp_mobile VARCHAR(10),
    otp_email VARCHAR(10),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
