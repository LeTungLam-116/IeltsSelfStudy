import React from 'react';

export const IconDashboard: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v4h8V3h-8zM3 21h8v-6H3v6z" />
  </svg>
);

export const IconUsers: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>
);

export const IconChart: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18"/>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 13l-4-4-4 4-4-6"/>
  </svg>
);

export const IconBook: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z"/>
  </svg>
);

export const IconNote: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 17h.01M12 7h.01M12 17h.01M17 7h.01M17 17h.01"/></svg>
);

export const IconPlus: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
  </svg>
);

export const IconUser: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9 9 0 1118.88 6.196 9 9 0 015.12 17.804z"/></svg>
);

export const IconCog: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06A2 2 0 117.03 2.7l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09c.1.6.54 1.12 1.14 1.42h0"/></svg>
);

export const IconEye: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
    <circle cx="12" cy="12" r="3" strokeWidth="2" />
  </svg>
);

export const IconEdit: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M11 5h6l2 2v6"/>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 15l-9 9-9-9 9-9 9 9z"/>
  </svg>
);

export const IconTrash: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18"/>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 6v14a2 2 0 002 2h4a2 2 0 002-2V6"/>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6"/>
  </svg>
);

export const IconDocument: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6"/>
  </svg>
);

export const IconMoney: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-3.866 0-7 1.79-7 4s3.134 4 7 4 7-1.79 7-4-3.134-4-7-4z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v4m0 8v4"/></svg>
);

export const IconClock: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12A9 9 0 113 12a9 9 0 0118 0z"/></svg>
);

export const IconBell: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/>
  </svg>
);

export const IconSearch: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"/>
  </svg>
);

export const IconArrowLeft: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
  </svg>
);

export const IconCheck: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
  </svg>
);

export const IconX: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

export const IconCheckCircle: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);

export const IconXCircle: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);

export const IconFilter: React.FC<{className?:string}> = ({className}) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
  </svg>
);

export default {
  IconDashboard,
  IconUsers,
  IconChart,
  IconBook,
  IconNote,
  IconPlus,
  IconUser,
  IconCog,
  IconEye,
  IconEdit,
  IconTrash,
  IconDocument,
  IconMoney,
  IconClock,
  IconBell,
  IconSearch
};


