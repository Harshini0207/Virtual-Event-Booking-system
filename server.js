const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "virtualevent"
});

db.connect((err) => {
    if (err) throw err;
    console.log("MySQL Connected");
});

/* Home */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/* Signup */
app.post("/signup", (req, res) => {
    const { name, email, phone, password } = req.body;

    db.query(
        "INSERT INTO users(Name,Email,Phone,Password) VALUES(?,?,?,?)",
        [name, email, phone, password],
        (err) => {
            if (err) throw err;
            res.redirect("/login.html");
        }
    );
});

/* Login */
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE Email=? AND Password=?",
        [email, password],
        (err, result) => {
            if (err) throw err;

            if (result.length > 0) {
                res.redirect("/dashboard.html");
            } else {
                res.send("Invalid Login");
            }
        }
    );
});

app.post("/book", (req, res) => {

    const { title, description, date, time, duration, price, seats } = req.body;

    const total = Number(price) * Number(seats);

    db.query(
        "INSERT INTO events(Title,Description,Date,Time,Duration,Price,OrganizerID) VALUES(?,?,?,?,?,?,1)",
        [title, description, date, time, duration, price],
        (err, eventResult) => {

            if (err) return res.send(err.message);

            const eventId = eventResult.insertId;

            db.query(
                "INSERT INTO bookings(UserID,EventID,BookingDate,SeatsBooked,TotalAmount) VALUES(1,?,?,?,?)",
                [eventId, new Date(), seats, total],
                (err2, bookingResult) => {

                    if (err2) return res.send(err2.message);

                    const bookingId = bookingResult.insertId;

                    res.redirect(`/payment.html?bookingId=${bookingId}&title=${title}&amount=${total}`);
                }
            );

        }
    );

});

/* Payment page */
app.get("/payment", (req, res) => {
    res.sendFile(path.join(__dirname, "payment.html"));
});

/* Pay now */
app.post("/paynow", (req, res) => {
    const { bookingId, title, amount, method } = req.body;

    const now = new Date();

    db.query(
        "INSERT INTO payments(BookingID,PaymentDate,Amount,PaymentMethod,Status) VALUES(?,?,?,?,?)",
        [bookingId, now, amount, method, "Success"],
        (err) => {
            if (err) throw err;

            res.send(`
            <html>
            <head>
            <link rel="stylesheet" href="/style.css">
            </head>
            <body>
            <div class="box">
                <h2>Payment Successful ✅</h2>
                <p>Event: ${title}</p>
                <p>Amount: ₹${amount}</p>
                <p>Method: ${method}</p>
                <p>Date: ${now}</p>

                <a href="/book_event.html"><button>Back</button></a>
                <a href="/view_booking_details"><button>View Booking Details</button></a>
            </div>
            </body>
            </html>
            `);
        }
    );
});

/* View all tables */
app.get("/view_booking_details", (req, res) => {

    db.query("SELECT * FROM users", (e1, users) => {
        db.query("SELECT * FROM organizers", (e2, organizers) => {
            db.query("SELECT * FROM events", (e3, events) => {
                db.query("SELECT * FROM bookings", (e4, bookings) => {
                    db.query("SELECT * FROM payments", (e5, payments) => {

                        function createTable(title, data) {
                            let rows = "";

                            if (data.length > 0) {
                                rows += "<tr>";
                                Object.keys(data[0]).forEach(col => rows += `<th>${col}</th>`);
                                rows += "</tr>";

                                data.forEach(row => {
                                    rows += "<tr>";
                                    Object.values(row).forEach(val => rows += `<td>${val}</td>`);
                                    rows += "</tr>";
                                });
                            } else {
                                rows = "<tr><td>No Data</td></tr>";
                            }

                            return `
                            <h2>${title}</h2>
                            <table border="1">${rows}</table><br>
                            `;
                        }

                        res.send(`
                        <html>
                        <head>
                        <link rel="stylesheet" href="/style.css">
                        </head>
                        <body>
                        ${createTable("Users", users)}
                        ${createTable("Organizers", organizers)}
                        ${createTable("Events", events)}
                        ${createTable("Bookings", bookings)}
                        ${createTable("Payments", payments)}
                        <a href="/dashboard.html"><button>Back</button></a>
                        </body>
                        </html>
                        `);
                    });
                });
            });
        });
    });

});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});