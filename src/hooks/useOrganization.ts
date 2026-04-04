import { useState, useCallback } from "react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  members: string[];
}

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (id) => {
    setLoading(true);
    const org: Organization = { id, name: "Organization", slug: "org", members: [] };
    setOrganization(org);
    setLoading(false);
  }, []);

  const addMember = useCallback((memberId) => {
    setOrganization(org => org ? { ...org, members: [...org.members, memberId] } : null);
  }, []);

  return { organization, loading, load, addMember };
}
