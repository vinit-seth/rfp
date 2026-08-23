import React, {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import { listProposals } from '../api';

export default function Proposals() {
  const [loading, setLoading] =
    useState(true);

  const [proposals, setProposals] =
    useState([]);

  const [err, setErr] =
    useState(null);

  /*useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const result = await listProposals();

        if (!Array.isArray(result)) {
          console.warn(
            'Expected proposals array, got:',
            result
          );

          if (mounted) {
            setProposals([]);
          }

          return;
        }

        if (mounted) {
          setProposals(result);
        }
      } catch (error) {
        console.error(
          'Failed to load proposals',
          error
        );

        if (mounted) {
          setErr(
            'Failed to load proposals'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []); */

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const result =
          await listProposals();

        if (
          mounted &&
          Array.isArray(result)
        ) {
          setProposals(result);
        }
      } catch (error) {
        console.error(
          'Failed to load proposals',
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    const interval =
      setInterval(load, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h2>
          Loading proposals…
        </h2>
      </div>
    );
  }

  if (err) {
    return (
      <div className="page">
        <h2>{err}</h2>
      </div>
    );
  }

  if (!proposals.length) {
    return (
      <div className="page">
        <h1>Proposals</h1>

        <div className="card">
          <h2>No proposals yet</h2>

          <p className="muted">
            Proposals will appear here when
            registered vendors reply to an RFP and
            the RFP ID can be identified from the
            email subject or body.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Proposals</h1>

      <p
        className="muted"
        style={{ marginBottom: 20 }}
      >
        Vendor responses automatically
        extracted from recent proposal emails.
      </p>

      <ul
        className="proposals-list"
        style={{
          listStyle: 'none',
          padding: 0,
        }}
      >
        {proposals.map((proposal) => {
          const rfp =
            proposal.rfp &&
              typeof proposal.rfp ===
              'object'
              ? proposal.rfp
              : null;

          const vendor =
            proposal.vendor &&
              typeof proposal.vendor ===
              'object'
              ? proposal.vendor
              : null;

          const rfpId =
            rfp?._id ||
            proposal.rfp ||
            null;

          const rfpTitle =
            rfp?.title ||
            'Unknown RFP';

          const vendorName =
            vendor?.name ||
            proposal.vendorName ||
            'Unknown vendor';

          const vendorEmail =
            vendor?.email ||
            proposal.contactEmail ||
            '';

          const total =
            typeof proposal.total ===
              'number'
              ? `₹${proposal.total.toLocaleString(
                'en-IN'
              )}`
              : proposal.total ||
              '—';

          return (
            <li
              key={proposal._id}
              style={{
                marginBottom: 18,
                background: '#fff',
                padding: 20,
                borderRadius: 8,
                boxShadow:
                  '0 0 0 1px #eee inset',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  gap: 20,
                }}
              >
                <div
                  style={{
                    flex: 1,
                  }}
                >
                  {/* Vendor */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems:
                        'baseline',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <strong
                      style={{
                        fontSize: 17,
                      }}
                    >
                      {vendorName}
                    </strong>

                    <span
                      style={{
                        color: '#555',
                      }}
                    >
                      — {total}
                    </span>
                  </div>

                  {/* Vendor email */}
                  {vendorEmail && (
                    <div
                      style={{
                        marginTop: 4,
                        color: '#777',
                        fontSize: 13,
                      }}
                    >
                      {vendorEmail}
                    </div>
                  )}

                  {/* RFP */}
                  <div
                    style={{
                      marginTop: 10,
                      color: '#555',
                    }}
                  >
                    <strong>
                      RFP:
                    </strong>{' '}
                    {rfpTitle}
                  </div>

                  {/* Proposal items */}
                  <div
                    style={{
                      marginTop: 12,
                    }}
                  >
                    <strong
                      style={{
                        fontSize: 14,
                      }}
                    >
                      Proposed items
                    </strong>

                    {Array.isArray(
                      proposal.items
                    ) &&
                      proposal.items.length ? (
                      <ul
                        style={{
                          marginTop: 6,
                          paddingLeft: 20,
                        }}
                      >
                        {proposal.items
                          .slice(0, 5)
                          .map(
                            (
                              item,
                              index
                            ) => (
                              <li
                                key={
                                  index
                                }
                                style={{
                                  fontSize: 13,
                                  color:
                                    '#333',
                                  marginBottom:
                                    3,
                                }}
                              >
                                <strong>
                                  {item.name ||
                                    'Item'}
                                </strong>

                                {' — '}

                                Qty:{' '}
                                {item.qty ??
                                  1}

                                {' — '}

                                {item.totalPrice !=
                                  null
                                  ? `₹${Number(
                                    item.totalPrice
                                  ).toLocaleString(
                                    'en-IN'
                                  )}`
                                  : item.unitPrice !=
                                    null
                                    ? `₹${Number(
                                      item.unitPrice
                                    ).toLocaleString(
                                      'en-IN'
                                    )} / unit`
                                    : 'Price not specified'}
                              </li>
                            )
                          )}
                      </ul>
                    ) : (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 13,
                          color: '#999',
                        }}
                      >
                        No line items could
                        be extracted.
                      </div>
                    )}
                  </div>

                  {/* Commercial terms */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 18,
                      marginTop: 14,
                      fontSize: 13,
                    }}
                  >
                    {proposal.deliveryDays && (
                      <span>
                        <strong>
                          Delivery:
                        </strong>{' '}
                        {
                          proposal.deliveryDays
                        }{' '}
                        days
                      </span>
                    )}

                    {proposal.paymentTerms && (
                      <span>
                        <strong>
                          Payment:
                        </strong>{' '}
                        {
                          proposal.paymentTerms
                        }
                      </span>
                    )}

                    {proposal.warranty && (
                      <span>
                        <strong>
                          Warranty:
                        </strong>{' '}
                        {proposal.warranty}
                      </span>
                    )}
                  </div>

                  {/* AI indicator */}
                  <div
                    style={{
                      marginTop: 14,
                      fontSize: 12,
                      color: '#777',
                    }}
                  >
                    AI-extracted from vendor
                    email
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    minWidth: 130,
                    textAlign: 'right',
                  }}
                >
                  {rfpId ? (
                    <Link
                      to={`/rfps/${rfpId}`}
                      className="btn"
                    >
                      View RFP
                    </Link>
                  ) : (
                    <button
                      className="btn"
                      disabled
                    >
                      View RFP
                    </button>
                  )}

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: '#999',
                    }}
                  >
                    {proposal.createdAt
                      ? new Date(
                        proposal.createdAt
                      ).toLocaleString()
                      : ''}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}