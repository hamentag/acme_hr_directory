const express = require('express')
const pg = require('pg')
const app = express()
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_db');

app.use(express.json())
app.use(require('morgan')('dev'))

// Error handling route
app.use((error, req, res, next)=>{
    res.status(res.status || 500).send({error : error})
});

//// API routes
// GET departments route 
app.get('/api/departments', async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from departments
    `
    const response = await client.query(SQL)
    res.send(response.rows)
  } catch (ex) {
    next(ex)
  }
})

// GET employees route 
app.get('/api/employees', async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from employees ORDER BY created_at DESC;
    `
    const response = await client.query(SQL)
    res.send(response.rows)
  } catch (ex) {
    next(ex)
  }
})

// CREATE route
app.post('/api/employees', async (req, res, next) => {
  try {
    const SQL = `
      INSERT INTO employees(name, department_id)
      VALUES($1, $2)
      RETURNING *
    `
    const response = await client.query(SQL, [req.body.name, req.body.department_id])
    res.send(response.rows[0])
  } catch (ex) {
    next(ex)
  }
})

// UPDATE route
app.put('/api/employees/:id', async (req, res, next) => {
  try {
    const SQL = `
      UPDATE employees
      SET name=$1, department_id=$2, updated_at= now()
      WHERE id=$3 RETURNING *
    `
    const response = await client.query(SQL, [
      req.body.name,
      req.body.department_id,
      req.params.id
    ])
    res.send(response.rows[0])
  } catch (ex) {
    next(ex)
  }
})

// DELETE route
app.delete('/api/employees/:id', async (req, res, next) => {
  try {
    const SQL = `
      DELETE from employees
      WHERE id = $1
    `
    const response = await client.query(SQL, [req.params.id])
    res.sendStatus(204)
  } catch (ex) {
    next(ex)
  }
})


// Init
const init = async () => {
  await client.connect()
  let SQL = `
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS departments;
    CREATE TABLE departments(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100)
    );
    CREATE TABLE employees(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      department_id INTEGER REFERENCES departments(id) NOT NULL
    );
  `
  await client.query(SQL)
  console.log('tables created')
  SQL = `
    INSERT INTO departments(name) VALUES('HR');
    INSERT INTO departments(name) VALUES('IT');
    INSERT INTO departments(name) VALUES('Marketing');
    INSERT INTO departments(name) VALUES('Sales');
    INSERT INTO employees(name, department_id) VALUES('Yasir Amentag', (SELECT id FROM departments WHERE name='IT'));
    INSERT INTO employees(name, department_id) VALUES('Sara Bard', (SELECT id FROM departments WHERE name='Marketing'));
    INSERT INTO employees(name, department_id) VALUES('John Bruce', (SELECT id FROM departments WHERE name='Marketing'));
    INSERT INTO employees(name, department_id) VALUES('Nisrine Ahmed', (SELECT id FROM departments WHERE name='HR'));
    INSERT INTO employees(name, department_id) VALUES('Noah Filan', (SELECT id FROM departments WHERE name='Sales'));
    INSERT INTO employees(name, department_id) VALUES('kylian Michel', (SELECT id FROM departments WHERE name='Sales'));
    INSERT INTO employees(name, department_id) VALUES('Adam Moe', (SELECT id FROM departments WHERE name='IT'));
    INSERT INTO employees(name, department_id) VALUES('Terry Hernandez', (SELECT id FROM departments WHERE name='IT'));
  `
  await client.query(SQL)
  console.log('data seeded')
  const port = process.env.PORT || 3000
  app.listen(port, () => console.log(`listening on port ${port}`))
}

init()