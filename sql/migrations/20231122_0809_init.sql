CREATE TABLE
  users (
    id SERIAL PRIMARY KEY,
    cdc_auth_token VARCHAR(250),
    learner_id INT4,
    email VARCHAR(250),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    photo_url VARCHAR(200),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

-- region AUTH
CREATE TABLE
  keys (
    id SERIAL PRIMARY KEY,
    user_id INT4 NOT NULL,
    kind INT2 NOT NULL,
    identification VARCHAR(50) NOT NULL,
    secret VARCHAR(60),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
  );

CREATE TABLE
  sessions (
    id SERIAL PRIMARY KEY,
    token VARCHAR(32) NOT NULL,
    user_id INT4 NOT NULL,
    key_id INT4 NOT NULL,
    expires_at TIMESTAMP(3),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (key_id) REFERENCES keys (id) ON DELETE CASCADE ON UPDATE CASCADE
  );

-- endregion AUTH
CREATE TABLE
  desired_days (
    id SERIAL PRIMARY KEY,
    user_id INT4,
    day_of_week INT2 DEFAULT 0,
    start_at_hour INT2 DEFAULT 0,
    start_at_minute INT2 DEFAULT 0,
    end_at_hour INT2 DEFAULT 0,
    end_at_minute INT2 DEFAULT 0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
  );

CREATE UNIQUE INDEX desired_days_user_id_day_of_week_uindex ON desired_days (user_id, day_of_week);
