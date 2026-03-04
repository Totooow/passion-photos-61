<template>
  <div class="flex flex-col" style="height: calc(100vh - 9rem)">
    <section class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <h1 class="font-[var(--font-serif)] text-5xl md:text-7xl font-black text-plum-dark tracking-tight">
        Passion Photos 61
      </h1>
      <p class="mt-4 text-lg md:text-xl text-plum-muted tracking-wide">
        Photographe Amatrice
      </p>
      <RouterLink
        to="/galerie"
        class="mt-10 inline-block px-8 py-3 bg-plum text-white rounded-full text-sm tracking-wide hover:bg-plum-light transition-colors"
      >
        Accéder à la galerie
      </RouterLink>
    </section>

    <svg
      class="w-full h-40 text-plum"
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 30C240 60 480 0 720 30C960 60 1200 0 1440 30"
        stroke="currentColor"
        stroke-width="3"
        fill="none"
      />
    </svg>
  </div>
</template>
