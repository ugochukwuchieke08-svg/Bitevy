export default function ShippingPolicy() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">
          Bitevy Shipping & Delivery Policy
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Last updated: September 6, 2026
        </p>

        <div className="mt-10 space-y-8 text-[15px] leading-7">
          <section>
            <h2 className="text-xl font-semibold">1. Overview</h2>
            <p className="mt-3">
              Bitevy is a food ordering and delivery platform that connects
              customers with restaurants and delivery riders.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Order Preparation</h2>
            <p className="mt-3">
              Once an order is placed and accepted, the restaurant is
              responsible for preparing the customer's order. Preparation
              times may vary depending on the restaurant, order size, and
              circumstances at the time of the order.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Delivery</h2>
            <p className="mt-3">
              Where delivery is requested, a rider may collect the prepared
              order from the restaurant and deliver it to the customer.
              Delivery times are estimates and may be affected by traffic,
              weather, restaurant preparation times, rider availability, and
              other circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              4. Customer Delivery Information
            </h2>
            <p className="mt-3">
              Customers are responsible for providing accurate delivery
              addresses and contact information. Incorrect or incomplete
              information may result in delays or an unsuccessful delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              5. Failed Delivery
            </h2>
            <p className="mt-3">
              Customers should remain available to receive their orders and
              respond to reasonable attempts by riders to contact them. If a
              customer cannot be reached or the delivery cannot reasonably be
              completed because of incorrect information or customer
              unavailability, the order may be cancelled or otherwise handled
              according to the circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Delays</h2>
            <p className="mt-3">
              Bitevy does not guarantee a specific delivery time. We will
              make reasonable efforts to facilitate delivery, but delays may
              occur due to circumstances outside the platform's control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              7. Restaurant and Rider Responsibilities
            </h2>
            <p className="mt-3">
              Restaurants are responsible for preparing orders correctly and
              making them available for collection. Riders are responsible for
              collecting accepted orders and making reasonable efforts to
              deliver them to the customer's provided location.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Contact</h2>
            <p className="mt-3">
              For questions or delivery-related issues, customers may contact
              Bitevy through the support channels available on the platform.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}