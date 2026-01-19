"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField, Button, Autocomplete, Stack, Alert } from "@mui/material";
import Confetti from "react-confetti";
import { CircularProgress, Box } from "@mui/material";
import { useWindowSize } from "react-use";

type Song = {
  id: number;
  title: string;
  artist: string;
  year: number;
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
    rankings: z
      .array(
        z.object({
          songId: z.number().min(1, "Selecteer een nummer"),
          rank: z.number(),
        }),
      )
      .length(5),
  })
  .refine(
    (data) =>
      data.countryType === "BELGIUM" ||
      (data.countryType === "OTHER" && data.countryName?.trim()),
    {
      message: "Land is verplicht",
      path: ["countryName"],
    },
  )
  .refine((data) => new Set(data.rankings.map((r) => r.songId)).size === 5, {
    message: "Een nummer mag maar 1 keer geslecteerd worden",
    path: ["rankings"],
  });

type FormData = z.infer<typeof voteSchema>;

export const VoterForm = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
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
      rankings: Array.from({ length: 5 }, () => ({ songId: 0, rank: 0 })),
    },
  });

  const rankings = watch("rankings");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch songs from API
  useEffect(() => {
    const loadSongs = async () => {
      try {
        const res = await fetch("/api/song", {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY!,
          },
        });
        const data = await res.json();
        setSongs(data.songs);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      } finally {
        setIsLoadingSongs(false);
      }
    };

    loadSongs();
  }, []);

  if (!isMounted) {
    return null;
  }

  if (isLoadingSongs) {
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
        <span>Nummers worden geladen…</span>
      </Box>
    );
  }

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        country: data.countryType,
        otherCountry: data.countryName,
        rankings: data.rankings.map((r, i) => ({
          songId: r.songId,
          rank: i + 1,
        })),
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
            json.error.message ||
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
            het tijdens de nacht van de carnaval top 100 in de Kazerne op 21/02
            of tijdens de liveuitzending op 08/03
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

        {/* Ranking dropdowns */}
        <Stack spacing={2}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Controller
              key={index}
              name={`rankings.${index}.songId`}
              control={control}
              render={({ field }) => {
                const selectedIds = rankings
                  .map((r) => r.songId)
                  .filter((id) => id !== 0 && id !== field.value);
                const options = songs.filter(
                  (s) => !selectedIds.includes(s.id),
                );

                return (
                  <Autocomplete
                    options={options.sort((a, b) => {
                      const artistCompare = a.artist.localeCompare(b.artist);
                      if (artistCompare !== 0) return artistCompare;
                      return a.title.localeCompare(b.title);
                    })}
                    getOptionLabel={(option) =>
                      `${option.artist} - ${option.title} (${option.year})`
                    }
                    value={options.find((s) => s.id === field.value) || null}
                    onChange={(_, newValue) =>
                      field.onChange(newValue?.id ?? 0)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={`Keuze ${index + 1}`}
                        error={!!errors.rankings?.[index]}
                        helperText={errors.rankings?.[index]?.songId?.message}
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
          ))}
        </Stack>

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
