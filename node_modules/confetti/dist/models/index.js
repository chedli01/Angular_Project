import block from './block.js';
import category from './category.js';
import contact from './contact.js';
import event from './event.js';
import image from './image.js';
import page from './page.js';
import payment from './payment.js';
import ticket from './ticket.js';
import webhook from './webhook.js';
import workspace from './workspace.js';
import ticketBatch from './ticket-batch.js';
export default {
    block: block(),
    category: category(),
    contact: contact(),
    event: event(),
    image: image(),
    page: page(),
    payment: payment(),
    ticket: ticket(),
    webhook: webhook(),
    workspace: workspace(),
    ticketBatch: ticketBatch(),
};
