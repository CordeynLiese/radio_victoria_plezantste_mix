"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField, Button, Autocomplete, Stack, Alert } from "@mui/material";
import Confetti from "react-confetti";
import { CircularProgress, Box } from "@mui/material";
import { useWindowSize } from "react-use";

type Mix = {
  id: string;
  artist: string;
};

// Zod schema
const voteSchema = z
  .object({
    name: z.string().min(1, "Naam is verplicht"),
    email: z.string().email("Ongeldig emailadres"),
    city: z.string().min(1, "Gemeente is verplicht"),
    postalCode: z.string().min(1, "Post code is verplicht"),
    countryType: z.enum(["BELGIUM", "OTHER"]),
    countryName: z.string().optional(),
    mixId: z.string().min(1, "Mix selectie is verplicht"),
  })
  .refine(
    (data) =>
      data.countryType === "BELGIUM" ||
      (data.countryType === "OTHER" && data.countryName?.trim()),
    {
      message: "Land is verplicht",
      path: ["countryName"],
    },
  );

type FormData = z.infer<typeof voteSchema>;

export const VoterForm = () => {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoadingMixes, setIsLoadingMixes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { width, height } = useWindowSize();

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(voteSchema),
    shouldFocusError: true,
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      city: "",
      postalCode: "",
      countryType: "BELGIUM",
      countryName: "",
      mixId: "",
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch mixes from API
  useEffect(() => {
    const loadMixes = async () => {
      try {
        const res = await fetch("/api/mix", {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY!,
          },
        });
        const data = await res.json();
        setMixes(data.mixes);
      } catch (err) {
        console.error("Failed to fetch mixes:", err);
      } finally {
        setIsLoadingMixes(false);
      }
    };

    loadMixes();
  }, []);

  if (!isMounted) {
    return null;
  }

  if (isLoadingMixes) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight={300}
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <span>Mixes worden geladen…</span>
      </Box>
    );
  }

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        name: data.name,
        email: data.email,
        city: data.city,
        postalCode: data.postalCode,
        country: data.countryType,
        otherCountry: data.countryName,
        mixId: data.mixId,
      };

      const res = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY!,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        setError("root", {
          type: "server",
          message:
            json.error?.message ||
            json.error ||
            "Er ging iets mis bij het verzenden van je stem",
        });
        return;
      }

      setSubmitSuccess(true);
    } catch {
      setError("root", {
        type: "server",
        message: "Er ging iets mis bij het verzenden van je stem",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <>
        <Confetti
          width={width}
          height={height}
          numberOfPieces={300}
          recycle={false}
        />

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={400}
          textAlign="center"
          gap={2}
        >
          <h2>🎉 Bedankt voor je stem! 🎉</h2>
          <p>
            We hebben je stem goed ontvangen! Benieuwd naar de winnaar? Ontdek
            het tijdens de laatste Carnavalitis in Cafe Bidon
          </p>
        </Box>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        {/* Voter info fields */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Naam"
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isSubmitting || submitSuccess}
                required
                fullWidth
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isSubmitting || submitSuccess}
                required
                fullWidth
              />
            )}
          />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} width="100%">
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Gemeente"
                error={!!errors.city}
                helperText={errors.city?.message}
                disabled={isSubmitting || submitSuccess}
                required
                fullWidth
              />
            )}
          />
          <Controller
            name="postalCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Post code"
                error={!!errors.postalCode}
                helperText={errors.postalCode?.message}
                disabled={isSubmitting || submitSuccess}
                required
                fullWidth
              />
            )}
          />
          <Controller
            name="countryType"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Land"
                SelectProps={{ native: true }}
                disabled={isSubmitting || submitSuccess}
                required
                fullWidth
              >
                <option value="BELGIUM">België</option>
                <option value="OTHER">Andere</option>
              </TextField>
            )}
          />
          {watch("countryType") === "OTHER" && (
            <Controller
              name="countryName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Land naam"
                  error={!!errors.countryName}
                  helperText={errors.countryName?.message}
                  disabled={isSubmitting || submitSuccess}
                  required
                  fullWidth
                />
              )}
            />
          )}
        </Stack>

        {/* Mix selection dropdown */}
        <Controller
          name="mixId"
          control={control}
          render={({ field }) => {
            const selectedMix = mixes.find((m) => m.id === field.value);
            return (
              <Autocomplete
                options={mixes.sort((a, b) => a.artist.localeCompare(b.artist))}
                getOptionLabel={(option) => option.artist}
                value={selectedMix || null}
                onChange={(_, newValue) => field.onChange(newValue?.id ?? "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Selecteer een mix"
                    error={!!errors.mixId}
                    helperText={errors.mixId?.message}
                    disabled={isSubmitting || submitSuccess}
                    required
                    fullWidth
                  />
                )}
                disabled={isSubmitting || submitSuccess}
              />
            );
          }}
        />

        {/* Error messages */}
        {errors.root?.message && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.root.message.toString()}
          </Alert>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || submitSuccess}
          fullWidth
        >
          Stem Verzenden
        </Button>
      </Stack>
    </form>
  );
};
