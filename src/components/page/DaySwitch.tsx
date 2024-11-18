'use client';

import React, { useState } from 'react';

type Tab = {
  name: string;
  href: string;
  current: boolean;
};

type DataItem = {
  data: string[];
};

const sampleData = {
  today: {
    data: [
      "1",
      "08:00 - 08:45",
      "10A",
      "Mathematik",
      "Raum 101",
      "Herr Müller",
      "",
      "Kein Vertretungstext"
    ]
  },
  nextDay: {
    data: [
      "2",
      "08:50 - 09:35",
      "10B",
      "Englisch",
      "Raum 102",
      "Frau Schmidt",
      "Bitte Bücher mitbringen",
      "Kein Vertretungstext"
    ]
  }
};

function getToday(): string {
  const today = new Date();
  return today.toLocaleDateString('de-DE', { weekday: 'long' });
}

function getNextWeekday(date: Date): string {
  const dayOfWeek = date.getDay();
  let nextDay;

  switch (dayOfWeek) {
    case 5: // Freitag
      nextDay = 3; // Montag
      break;
    case 6: // Samstag
      nextDay = 2; // Montag
      break;
    default:
      nextDay = 1; // Nächster Tag
      break;
  }

  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + nextDay);
  return nextDate.toLocaleDateString('de-DE', { weekday: 'long' });
}

const today = new Date();
const tabs: Tab[] = [
  { name: getToday(), href: '#', current: true },
  { name: getNextWeekday(today), href: '#', current: false }
];

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Button() {
  const [currentTab, setCurrentTab] = useState(tabs[0].name);

  const handleTabClick = (tabName: string) => {
    setCurrentTab(tabName);
    tabs.forEach(tab => tab.current = tab.name === tabName);
  };

  const currentData = currentTab === getToday() ? sampleData.today : sampleData.nextDay;

  return (
    <div className="max-w-full mx-auto mt-10">
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Wählen Sie einen Tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500"
          value={currentTab}
          onChange={(e) => handleTabClick(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav className="isolate flex justify-center divide-x divide-zinc-200 dark:divide-zinc-700 rounded-lg shadow" aria-label="Tabs">
          {tabs.map((tab, tabIdx) => (
            <a
              key={tab.name}
              href={tab.href}
              onClick={(e) => {
                e.preventDefault();
                handleTabClick(tab.name);
              }}
              className={classNames(
                tab.current ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-all duration-100',
                tabIdx === 0 ? 'rounded-l-lg' : '',
                tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                'group relative min-w-0 flex-1 overflow-hidden bg-white dark:bg-zinc-800 px-4 py-4 text-center text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:z-10'
              )}
              aria-current={tab.current ? 'page' : undefined}
            >
              <span>{tab.name}</span>
              <span
                aria-hidden="true"
                className={classNames(
                  tab.current ? 'bg-indigo-500 w-full' : 'bg-transparent',
                  'absolute inset-x-0 bottom-0 h-0.5 transition-all duration-300'
                )}
              />
            </a>
          ))}
        </nav>
      </div>
      <div className="mt-5 p-6 rounded-lg shadow-lg bg-white dark:bg-zinc-800">
        <p><strong>Stunde:</strong> {currentData.data[0]}</p>
        <p><strong>Zeit:</strong> {currentData.data[1]}</p>
        <p><strong>Klassen:</strong> {currentData.data[2]}</p>
        <p><strong>Fach:</strong> {currentData.data[3]}</p>
        <p><strong>Raum:</strong> <span dangerouslySetInnerHTML={{ __html: currentData.data[4] }} /></p>
        <p><strong>Lehrkraft:</strong> <span dangerouslySetInnerHTML={{ __html: currentData.data[5] }} /></p>
        <p><strong>Info:</strong> {currentData.data[6] ? <span dangerouslySetInnerHTML={{ __html: currentData.data[6] }} /> : "Keine Info"}</p>
        <p><strong>Vertretungstext:</strong> {currentData.data[7] ? <span dangerouslySetInnerHTML={{ __html: currentData.data[7] }} /> : "Kein Vertretungstext"}</p>
      </div>
    </div>
  );
}