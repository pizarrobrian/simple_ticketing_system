let tickets = [];

let currentTicketId = null;

let replyType = "reply";





/* =========================================================
   API
========================================================= */

async function getTickets() {

    const response =
        await fetch("/api/tickets");


    if (!response.ok) {

        throw new Error(
            "Failed to load tickets"
        );

    }


    tickets =
        await response.json();

}


/* =========================================================
   LOAD APPLICATION
========================================================= */

async function initialize() {

    try {

        await getTickets();

        updateDashboard();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server."
        );

    }

}


initialize();


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(
            element =>
                element.classList.add("hidden")
        );


    document
        .getElementById(
            page + "Page"
        )
        .classList.remove("hidden");


    document
        .querySelectorAll(".nav-btn")
        .forEach(
            button =>
                button.classList.remove("active")
        );


    const buttons =
        document.querySelectorAll(
            ".nav-btn"
        );


    if (page === "dashboard") {

        buttons[0]
            .classList.add("active");

        document.getElementById(
            "pageTitle"
        ).textContent =
            "Dashboard";

        document.getElementById(
            "pageDescription"
        ).textContent =
            "Overview of your support tickets";

        updateDashboard();

    }


    if (page === "tickets") {

        buttons[1]
            .classList.add("active");

        document.getElementById(
            "pageTitle"
        ).textContent =
            "Tickets";

        document.getElementById(
            "pageDescription"
        ).textContent =
            "Manage customer support requests";

        renderTickets();

    }


    if (page === "reports") {

        buttons[2]
            .classList.add("active");

        document.getElementById(
            "pageTitle"
        ).textContent =
            "Reports";

        document.getElementById(
            "pageDescription"
        ).textContent =
            "Ticket statistics";

        renderReports();

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const total =
        tickets.length;


    const open =
        tickets.filter(
            ticket =>
                ticket.status === "Open"
        ).length;


    const pending =
        tickets.filter(
            ticket =>
                ticket.status === "Pending"
        ).length;


    const solved =
        tickets.filter(
            ticket =>
                ticket.status === "Solved" ||
                ticket.status === "Closed"
        ).length;


    document.getElementById(
        "totalTickets"
    ).textContent =
        total;


    document.getElementById(
        "openTickets"
    ).textContent =
        open;


    document.getElementById(
        "pendingTickets"
    ).textContent =
        pending;


    document.getElementById(
        "solvedTickets"
    ).textContent =
        solved;


    document.getElementById(
        "ticketCount"
    ).textContent =
        total;


    renderRecentTickets();

}


/* =========================================================
   RECENT TICKETS
========================================================= */

function renderRecentTickets() {

    const container =
        document.getElementById(
            "recentTickets"
        );


    const recent =
        [...tickets]
            .sort(
                (a, b) =>
                    b.id - a.id
            )
            .slice(0, 5);


    container.innerHTML = "";


    recent.forEach(ticket => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "recent-ticket";


        div.onclick =
            () =>
                openTicket(ticket.id);


        div.innerHTML = `

            <div>

                <strong>
                    #${ticket.id}
                    -
                    ${ticket.subject}
                </strong>

                <small>
                    ${ticket.requester}
                    ·
                    ${ticket.category}
                </small>

            </div>

            <span class="badge ${getStatusClass(ticket.status)}">
                ${ticket.status}
            </span>

        `;


        container.appendChild(div);

    });

}


/* =========================================================
   TICKET TABLE
========================================================= */

function renderTickets() {

    const table =
        document.getElementById(
            "ticketTable"
        );


    const search =
        document.getElementById(
            "search"
        ).value.toLowerCase();


    const status =
        document.getElementById(
            "statusFilter"
        ).value;


    const priority =
        document.getElementById(
            "priorityFilter"
        ).value;


    const category =
        document.getElementById(
            "categoryFilter"
        ).value;


    const filtered =
        tickets.filter(ticket => {

            const matchesSearch =

                ticket.subject
                    .toLowerCase()
                    .includes(search)

                ||

                ticket.requester
                    .toLowerCase()
                    .includes(search)

                ||

                String(ticket.id)
                    .includes(search);


            const matchesStatus =
                status === "all" ||
                ticket.status === status;


            const matchesPriority =
                priority === "all" ||
                ticket.priority === priority;


            const matchesCategory =
                category === "all" ||
                ticket.category === category;


            return (

                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesCategory

            );

        });


    table.innerHTML = "";


    filtered.forEach(ticket => {

        const row =
            document.createElement(
                "tr"
            );


        row.onclick =
            () =>
                openTicket(ticket.id);


        row.innerHTML = `

            <td>
                #${ticket.id}
            </td>

            <td>
                ${ticket.requester}
            </td>

            <td>
                <strong>
                    ${ticket.subject}
                </strong>
            </td>

            <td>
                ${ticket.category}
            </td>

            <td>
                ${ticket.priority}
            </td>

            <td>

                <span class="badge ${getStatusClass(ticket.status)}">
                    ${ticket.status}
                </span>

            </td>

            <td>
                ${ticket.assignee}
            </td>

        `;


        table.appendChild(row);

    });

}


/* =========================================================
   STATUS CSS CLASS
========================================================= */

function getStatusClass(status) {

    return status
        .toLowerCase()
        .replace(
            " ",
            "-"
        );

}


/* =========================================================
   CREATE TICKET
========================================================= */

function openCreateTicket() {

    document
        .getElementById(
            "createModal"
        )
        .classList.remove("hidden");

}


function closeCreateTicket() {

    document
        .getElementById(
            "createModal"
        )
        .classList.add("hidden");

}


/* =========================================================
   CREATE TICKET FORM
========================================================= */

document
    .getElementById(
        "ticketForm"
    )
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const ticket = {

                requester:
                    document.getElementById(
                        "requester"
                    ).value,

                requesterEmail:
                    document.getElementById(
                        "requesterEmail"
                    ).value,

                subject:
                    document.getElementById(
                        "subject"
                    ).value,

                description:
                    document.getElementById(
                        "description"
                    ).value,

                category:
                    document.getElementById(
                        "category"
                    ).value,

                priority:
                    document.getElementById(
                        "priority"
                    ).value,

                assignee:
                    document.getElementById(
                        "assignee"
                    ).value

            };


            try {

                const response =
                    await fetch(
                        "/api/tickets",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(ticket)

                        }
                    );


                    const responseText = await response.text();

                    console.log("Create ticket response:", responseText);
                    
                    let data;
                    
                    try {
                        data = JSON.parse(responseText);
                    } catch (error) {
                        console.error("Server returned non-JSON:", responseText);
                        throw new Error("Server returned HTML instead of JSON.");
                    }


                if (!response.ok) {

                    throw new Error(
                        data.error
                    );

                }


                tickets.push(data);


                this.reset();


                closeCreateTicket();


                updateDashboard();


                alert(
                    `Ticket #${data.id} created!`
                );


                showPage("tickets");


            } catch (error) {

                alert(
                    error.message
                );

            }

        }
    );


/* =========================================================
   OPEN TICKET
========================================================= */

async function openTicket(id) {

    try {

        const response =
            await fetch(
                `/api/tickets/${id}`
            );


        const ticket =
            await response.json();


        if (!response.ok) {

            throw new Error(
                ticket.error
            );

        }


        currentTicketId =
            id;


        document.getElementById(
            "detailId"
        ).textContent =
            "#" + ticket.id;


        document.getElementById(
            "detailSubject"
        ).textContent =
            ticket.subject;


        document.getElementById(
            "infoRequester"
        ).textContent =
            ticket.requester;


        document.getElementById(
            "infoEmail"
        ).textContent =
            ticket.requesterEmail;


        document.getElementById(
            "infoCategory"
        ).textContent =
            ticket.category;


        document.getElementById(
            "infoCreated"
        ).textContent =
            ticket.createdAt;


        document.getElementById(
            "detailStatus"
        ).value =
            ticket.status;


        document.getElementById(
            "detailPriority"
        ).value =
            ticket.priority;


        document.getElementById(
            "detailAssignee"
        ).value =
            ticket.assignee;


        renderMessages(
            ticket
        );


        document
            .getElementById(
                "ticketModal"
            )
            .classList.remove(
                "hidden"
            );


    } catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================================
   CLOSE TICKET
========================================================= */

function closeTicket() {

    document
        .getElementById(
            "ticketModal"
        )
        .classList.add(
            "hidden"
        );


    currentTicketId =
        null;

}


/* =========================================================
   RENDER MESSAGES
========================================================= */

function renderMessages(ticket) {

    const container =
        document.getElementById(
            "messages"
        );


    container.innerHTML = "";


    ticket.messages.forEach(
        message => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "message " +
                (
                    message.type === "note"
                        ? "internal-note"
                        : ""
                );


            const initials =
                message.sender
                    .split(" ")
                    .map(
                        name =>
                            name[0]
                    )
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();


            div.innerHTML = `

                <div class="message-avatar">
                    ${initials}
                </div>

                <div class="message-content">

                    <div class="message-header">

                        <strong>
                            ${message.sender}

                            ${
                                message.type === "note"
                                    ? " · Internal Note"
                                    : ""
                            }

                        </strong>

                        <small>
                            ${message.time}
                        </small>

                    </div>

                    <p>
                        ${message.message}
                    </p>

                </div>

            `;


            container.appendChild(
                div
            );

        }
    );

}


/* =========================================================
   REPLY / INTERNAL NOTE
========================================================= */

function setReplyType(type) {

    replyType =
        type;


    document
        .getElementById(
            "replyTab"
        )
        .classList.remove(
            "active"
        );


    document
        .getElementById(
            "noteTab"
        )
        .classList.remove(
            "active"
        );


    if (type === "reply") {

        document
            .getElementById(
                "replyTab"
            )
            .classList.add(
                "active"
            );


        document
            .getElementById(
                "replyMode"
            )
            .textContent =
            "Public reply";


        document
            .getElementById(
                "reply"
            )
            .placeholder =
            "Type your reply...";

    } else {

        document
            .getElementById(
                "noteTab"
            )
            .classList.add(
                "active"
            );


        document
            .getElementById(
                "replyMode"
            )
            .textContent =
            "Internal note";


        document
            .getElementById(
                "reply"
            )
            .placeholder =
            "Type an internal note...";

    }

}


/* =========================================================
   SEND REPLY
========================================================= */

async function sendReply() {

    if (!currentTicketId) {
        return;
    }


    const input =
        document.getElementById(
            "reply"
        );


    const message =
        input.value.trim();


    if (!message) {

        alert(
            "Please enter a message."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `/api/tickets/${currentTicketId}/messages`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            message,

                            type:
                                replyType

                        })

                }
            );


        const ticket =
            await response.json();


        if (!response.ok) {

            throw new Error(
                ticket.error
            );

        }


        input.value = "";


        renderMessages(
            ticket
        );


        /* Update local ticket */

        const index =
            tickets.findIndex(
                ticket =>
                    ticket.id ===
                    currentTicketId
            );


        if (index !== -1) {

            tickets[index] =
                ticket;

        }


    } catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================================
   SAVE TICKET
========================================================= */

async function saveTicket() {

    if (!currentTicketId) {
        return;
    }


    const changes = {

        status:
            document.getElementById(
                "detailStatus"
            ).value,

        priority:
            document.getElementById(
                "detailPriority"
            ).value,

        assignee:
            document.getElementById(
                "detailAssignee"
            ).value

    };


    try {

        const response =
            await fetch(
                `/api/tickets/${currentTicketId}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            changes
                        )

                }
            );


        const ticket =
            await response.json();


        if (!response.ok) {

            throw new Error(
                ticket.error
            );

        }


        const index =
            tickets.findIndex(
                ticket =>
                    ticket.id ===
                    currentTicketId
            );


        if (index !== -1) {

            tickets[index] =
                ticket;

        }


        updateDashboard();


        renderTickets();


        alert(
            "Ticket updated successfully!"
        );


    } catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================================
   DELETE TICKET
========================================================= */

async function deleteTicket() {

    if (!currentTicketId) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this ticket?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/tickets/${currentTicketId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error
            );

        }


        tickets =
            tickets.filter(
                ticket =>
                    ticket.id !==
                    currentTicketId
            );


        closeTicket();


        updateDashboard();


        renderTickets();


        alert(
            "Ticket deleted successfully!"
        );


    } catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================================
   REPORTS
========================================================= */

function renderReports() {

    const container =
        document.getElementById(
            "reports"
        );


    const statuses = [

        "Open",
        "Pending",
        "Solved",
        "Closed"

    ];


    container.innerHTML = "";


    statuses.forEach(status => {

        const count =
            tickets.filter(
                ticket =>
                    ticket.status ===
                    status
            ).length;


        const percentage =
            tickets.length === 0
                ? 0
                : Math.round(
                    count /
                    tickets.length *
                    100
                );


        container.innerHTML += `

            <div style="margin:20px 0">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:6px;
                ">

                    <span>
                        ${status}
                    </span>

                    <strong>
                        ${count}
                    </strong>

                </div>


                <div style="
                    height:10px;
                    background:#e5e7eb;
                    border-radius:10px;
                    overflow:hidden;
                ">

                    <div style="
                        width:${percentage}%;
                        height:100%;
                        background:#2563eb;
                    "></div>

                </div>

            </div>

        `;

    });

}
