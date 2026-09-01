const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

//const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(
    __dirname,
    "data",
    "tickets.json"
);


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json());

app.use(express.static(
    path.join(__dirname, "public")
));

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function readTickets() {

    try {

        const data =
            fs.readFileSync(
                DATA_FILE,
                "utf8"
            );

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Error reading tickets:",
            error
        );

        return [];

    }

}


function saveTickets(tickets) {

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(
            tickets,
            null,
            4
        )
    );

}


function getNextTicketId(tickets) {

    if (tickets.length === 0) {
        return 1001;
    }

    const highestId =
        Math.max(
            ...tickets.map(
                ticket => ticket.id
            )
        );

    return highestId + 1;

}


/* =========================================================
   GET ALL TICKETS
========================================================= */

app.get("/api/tickets", (req, res) => {

    const tickets =
        readTickets();

    res.json(tickets);

});


/* =========================================================
   GET SINGLE TICKET
========================================================= */

app.get(
    "/api/tickets/:id",
    (req, res) => {

        const tickets =
            readTickets();

        const id =
            Number(req.params.id);

        const ticket =
            tickets.find(
                ticket =>
                    ticket.id === id
            );


        if (!ticket) {

            return res.status(404).json({

                error: "Ticket not found"

            });

        }


        res.json(ticket);

    }
);


/* =========================================================
   CREATE TICKET
========================================================= */

app.post(
    "/api/tickets",
    (req, res) => {

        const tickets =
            readTickets();


        const {

            requester,
            requesterEmail,
            subject,
            description,
            category,
            priority,
            assignee

        } = req.body;


        /* Validate required fields */

        if (
            !requester ||
            !requesterEmail ||
            !subject ||
            !description
        ) {

            return res.status(400).json({

                error:
                    "Requester, email, subject and description are required."

            });

        }


        const newTicket = {

            id:
                getNextTicketId(tickets),

            requester,

            requesterEmail,

            subject,

            description,

            category:
                category || "Other",

            priority:
                priority || "Normal",

            status:
                "Open",

            assignee:
                assignee || "Unassigned",

            createdAt:
                new Date().toLocaleString(),

            messages: [

                {

                    sender: requester,

                    type: "reply",

                    message: description,

                    time:
                        new Date().toLocaleTimeString(
                            [],
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        )

                }

            ]

        };


        tickets.push(newTicket);


        saveTickets(tickets);


        res.status(201).json(newTicket);

    }
);


/* =========================================================
   UPDATE TICKET
========================================================= */

app.put(
    "/api/tickets/:id",
    (req, res) => {

        const tickets =
            readTickets();


        const id =
            Number(req.params.id);


        const ticketIndex =
            tickets.findIndex(
                ticket =>
                    ticket.id === id
            );


        if (ticketIndex === -1) {

            return res.status(404).json({

                error: "Ticket not found"

            });

        }


        const {

            status,
            priority,
            assignee,
            category

        } = req.body;


        if (status !== undefined) {

            tickets[ticketIndex].status =
                status;

        }


        if (priority !== undefined) {

            tickets[ticketIndex].priority =
                priority;

        }


        if (assignee !== undefined) {

            tickets[ticketIndex].assignee =
                assignee;

        }


        if (category !== undefined) {

            tickets[ticketIndex].category =
                category;

        }


        saveTickets(tickets);


        res.json(
            tickets[ticketIndex]
        );

    }
);


/* =========================================================
   ADD MESSAGE / REPLY
========================================================= */

app.post(
    "/api/tickets/:id/messages",
    (req, res) => {

        const tickets =
            readTickets();


        const id =
            Number(req.params.id);


        const ticket =
            tickets.find(
                ticket =>
                    ticket.id === id
            );


        if (!ticket) {

            return res.status(404).json({

                error: "Ticket not found"

            });

        }


        const {

            message,
            type

        } = req.body;


        if (!message) {

            return res.status(400).json({

                error: "Message is required"

            });

        }


        ticket.messages.push({

            sender:
                "Brian Pizarro",

            type:
                type || "reply",

            message,

            time:
                new Date().toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )

        });


        saveTickets(tickets);


        res.json(ticket);

    }
);


/* =========================================================
   DELETE TICKET
========================================================= */

app.delete(
    "/api/tickets/:id",
    (req, res) => {

        const tickets =
            readTickets();


        const id =
            Number(req.params.id);


        const newTickets =
            tickets.filter(
                ticket =>
                    ticket.id !== id
            );


        if (
            newTickets.length ===
            tickets.length
        ) {

            return res.status(404).json({

                error: "Ticket not found"

            });

        }


        saveTickets(newTickets);


        res.json({

            message:
                "Ticket deleted successfully."

        });

    }
);


/* =========================================================
   EXPORT APP FOR VERCEL
========================================================= */

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`SupportDesk running at http://localhost:${PORT}`);
    });
}

module.exports = app;