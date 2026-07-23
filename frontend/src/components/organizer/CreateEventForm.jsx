import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";
import { createEvent } from "../../services/eventService";
import { getAllOrganizations } from "../../services/organizationService";
import { getAllDepartments } from "../../services/departmentService";

function CreateEventForm() {
  const { token } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      eventMode: "offline",
      visibility: "public",
      isPaid: false,
    },
  });

  const isPaid = watch("isPaid");

  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const orgs = await getAllOrganizations();
      const depts = await getAllDepartments();

      setOrganizations(orgs);
      setDepartments(depts);
    } catch {
      toast.error("Failed to load data");
    }
  }

  async function onSubmit(data) {
    try {
      const payload = {
        ...data,
        organizationId: data.organizationId,
        departmentId: data.departmentId,
        location: {
          address: data.address,
          city: data.city,
          country: data.country,
        },
      };

      delete payload.address;
      delete payload.city;
      delete payload.country;

      await createEvent(payload, token);

      toast.success("Event created successfully");

      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create event");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">
        Create Event
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <input
          placeholder="Title"
          className="w-full border p-3 rounded"
          {...register("title", { required: true })}
        />

        <textarea
          placeholder="Description"
          className="w-full border p-3 rounded"
          {...register("description")}
        />

        <select
          className="w-full border p-3 rounded"
          {...register("category")}
        >
          <option value="workshop">Workshop</option>
          <option value="hackathon">Hackathon</option>
          <option value="concert">Concert</option>
          <option value="recruitment">Recruitment</option>
          <option value="seminar">Seminar</option>
          <option value="sports">Sports</option>
          <option value="other">Other</option>
        </select>

        <select
          className="w-full border p-3 rounded"
          {...register("organizationId", { required: true })}
        >
          <option value="">Select Organization</option>

          {organizations.map((org) => (
            <option key={org._id} value={org._id}>
              {org.name}
            </option>
          ))}
        </select>

        <select
          className="w-full border p-3 rounded"
          {...register("departmentId")}
        >
          <option value="">Select Department</option>

          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          className="w-full border p-3 rounded"
          {...register("eventMode")}
        >
          <option value="offline">Offline</option>
          <option value="online">Online</option>
          <option value="hybrid">Hybrid</option>
        </select>

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isPaid")} />
          Paid Event
        </label>

        {isPaid && (
          <input
            type="number"
            placeholder="Ticket Price"
            className="w-full border p-3 rounded"
            {...register("ticketPrice")}
          />
        )}

        <input
          placeholder="Address"
          className="w-full border p-3 rounded"
          {...register("address")}
        />

        <input
          placeholder="City"
          className="w-full border p-3 rounded"
          {...register("city")}
        />

        <input
          placeholder="Country"
          className="w-full border p-3 rounded"
          {...register("country")}
        />

        <input
          type="datetime-local"
          className="w-full border p-3 rounded"
          {...register("eventDate", { required: true })}
        />

        <input
          type="number"
          placeholder="Maximum Participants"
          className="w-full border p-3 rounded"
          {...register("maxParticipants")}
        />

        <input
          placeholder="Poster URL"
          className="w-full border p-3 rounded"
          {...register("poster")}
        />

        <button
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}

export default CreateEventForm;